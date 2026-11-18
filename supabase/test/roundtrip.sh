#!/bin/bash
# Walks author -> moderator -> public against a real Postgres, exactly as
# the app does: every step is one transaction with the API role and JWT
# claim PostgREST sets. Writes are wrapped in
# `with x as (... returning 1) select count(*)` so each step yields a
# number rather than a command tag, making a refusal unambiguously either
# an ERROR or a 0.
#
#   bash supabase/test/roundtrip.sh [port]
#
# Needs a Postgres reachable as the postgres superuser. Creates (and
# drops) a database named ilmxona_roundtrip.
set -u

PORT="${1:-5433}"
HOST="${PGHOST:-/tmp}"
DB=ilmxona_roundtrip
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ADMIN="psql -h $HOST -p $PORT -U postgres -tAXq"
PSQL="$ADMIN -d $DB"
PASS=0; FAIL=0

for r in anon authenticated; do
  $ADMIN -d postgres -c "do \$\$ begin
    if not exists (select 1 from pg_roles where rolname='$r') then
      execute 'create role $r nologin';
    end if; end \$\$;" >/dev/null
done
$ADMIN -d postgres -c "do \$\$ begin
  if not exists (select 1 from pg_roles where rolname='service_role') then
    execute 'create role service_role nologin bypassrls';
  end if; end \$\$;" >/dev/null
$ADMIN -d postgres -c "grant anon, authenticated, service_role to postgres;" >/dev/null 2>&1

$ADMIN -d postgres -c "drop database if exists $DB;" >/dev/null
$ADMIN -d postgres -c "create database $DB;" >/dev/null
$PSQL -v ON_ERROR_STOP=1 -f "$ROOT/supabase/test/harness.sql" >/dev/null || exit 1
for f in "$ROOT"/supabase/sql/*.sql; do
  if ! $PSQL -v ON_ERROR_STOP=1 -f "$f" >/dev/null 2>"$DB.err"; then
    echo "migration failed: $f"; cat "$DB.err"; rm -f "$DB.err"; exit 1
  fi
done
rm -f "$DB.err"
echo "database $DB: harness + $(ls "$ROOT"/supabase/sql/*.sql | wc -l) migrations applied"
echo

as() { # as <role> <uid|""> <sql>  -> single scalar, or ERROR:...
  local role="$1" uid="$2" sql="$3" claims out
  if [ -n "$uid" ]; then claims="{\"sub\":\"$uid\",\"role\":\"$role\"}"; else claims="{\"role\":\"$role\"}"; fi
  out=$($PSQL -c "begin; set local role $role; set local request.jwt.claims='$claims'; $sql; commit;" 2>&1)
  if echo "$out" | grep -q '^ERROR'; then echo "ERROR:$(echo "$out" | grep '^ERROR' | head -1 | cut -c1-70)"
  else echo "$out" | sed '/^$/d' | head -1; fi
}
root() { $PSQL -c "$1" 2>&1 | sed '/^$/d' | head -1; }

check() {
  if [ "$2" == "$3" ]; then PASS=$((PASS+1)); printf '  ok   %s\n' "$1"
  else FAIL=$((FAIL+1)); printf '  FAIL %s\n         expected: %s\n         actual:   %s\n' "$1" "$2" "$3"; fi
}
refused() { # a refusal is an ERROR or zero rows affected -- nothing else
  case "$1" in
    ERROR:*) PASS=$((PASS+1)); printf '  ok   %s — refused (%s)\n' "$2" "${1:6:46}" ;;
    0)       PASS=$((PASS+1)); printf '  ok   %s — refused (0 rows)\n' "$2" ;;
    *)       FAIL=$((FAIL+1)); printf '  FAIL %s WAS ALLOWED: %s\n' "$2" "$1" ;;
  esac
}

echo "== 1. Signup creates profiles via the trigger"
AUTHOR=$(root "insert into auth.users (email, raw_user_meta_data) values ('author@x.uz','{\"full_name\":\"Aziz Karimov\"}') returning id;")
MOD=$(root "insert into auth.users (email, raw_user_meta_data) values ('mod@x.uz','{\"full_name\":\"Malika\"}') returning id;")
OTHER=$(root "insert into auth.users (email, raw_user_meta_data) values ('other@x.uz','{}') returning id;")
check "three profiles auto-created" "3" "$(root "select count(*) from public.profiles;")"
check "default role is USER" "USER" "$(root "select role from public.profiles where id='$AUTHOR';")"
check "username derived from OAuth metadata" "1" "$(root "select count(*) from public.profiles where id='$AUTHOR' and username is not null and username <> '';")"

echo "== 2. Bootstrapping the first admin (the manual step)"
root "update public.profiles set role='MODERATOR' where id='$MOD';" >/dev/null
check "moderator promoted" "MODERATOR" "$(root "select role from public.profiles where id='$MOD';")"

echo "== 2b. Privilege escalation is refused (regression for 008)"
ESC=$(root "select id from public.profiles where id='$OTHER';")
refused "$(as authenticated "$OTHER" "with u as (update public.profiles set role='ADMIN' where id='$ESC' returning 1) select count(*) from u;")" "USER promoting themselves to ADMIN"
check "they are still a USER" "USER" "$(root "select role from public.profiles where id='$ESC';")"
check "authenticated may update only 4 profile columns" "avatar_url, bio, display_name, username" \
  "$(root "select coalesce(string_agg(column_name,', ' order by column_name),'(none)') from information_schema.column_privileges where grantee='authenticated' and table_name='profiles' and privilege_type='UPDATE';")"
check "a normal profile edit still works" "1" \
  "$(as authenticated "$OTHER" "with u as (update public.profiles set display_name='Yangi Ism' where id='$ESC' returning 1) select count(*) from u;")"

echo "== 3. A plain USER writes a course"
COURSE=$(as authenticated "$AUTHOR" "with c as (insert into public.courses (slug,title,subtitle,author_id,status) values ('moliya','Moliyaviy savodxonlik','Pul boshqaruvi','$AUTHOR','DRAFT') returning id) select id from c;")
check "course created as DRAFT" "1" "$(echo "$COURSE" | grep -c '^[0-9a-f-]\{36\}$')"
refused "$(as authenticated "$AUTHOR" "with c as (insert into public.courses (slug,title,author_id,status) values ('x','X','$AUTHOR','PUBLISHED') returning 1) select count(*) from c;")" "USER inserting a PUBLISHED course"
refused "$(as authenticated "$AUTHOR" "with c as (insert into public.courses (slug,title,author_id,status) values ('y','Y','$OTHER','DRAFT') returning 1) select count(*) from c;")" "USER creating a course owned by someone else"

echo "== 4. Draft visibility"
check "anon cannot see the draft"    "0" "$(as anon "" "select count(*) from public.courses;")"
check "author sees their own draft"  "1" "$(as authenticated "$AUTHOR" "select count(*) from public.courses;")"
check "another user cannot see it"   "0" "$(as authenticated "$OTHER" "select count(*) from public.courses;")"
check "moderator sees it"            "1" "$(as authenticated "$MOD" "select count(*) from public.courses;")"

echo "== 5. Modules and lessons"
MOD1=$(as authenticated "$AUTHOR" "with m as (insert into public.modules (course_id,title,position) values ('$COURSE','Kirish',0) returning id) select id from m;")
check "module created" "1" "$(echo "$MOD1" | grep -c '^[0-9a-f-]\{36\}$')"
L1=$(as authenticated "$AUTHOR" "with l as (insert into public.lessons (course_id,module_id,slug,title,author_id,status,position) values ('$COURSE','$MOD1','byudjet','Byudjet tuzish','$AUTHOR','DRAFT',0) returning id) select id from l;")
check "lesson created as DRAFT" "1" "$(echo "$L1" | grep -c '^[0-9a-f-]\{36\}$')"
L2=$(as authenticated "$AUTHOR" "with l as (insert into public.lessons (course_id,slug,title,author_id,status,position) values ('$COURSE','jamgarma','Jamgarma','$AUTHOR','SUBMITTED',1) returning id) select id from l;")
check "lesson may be created already SUBMITTED (007)" "1" "$(echo "$L2" | grep -c '^[0-9a-f-]\{36\}$')"
refused "$(as authenticated "$AUTHOR" "with l as (insert into public.lessons (course_id,slug,title,author_id,status) values ('$COURSE','p','P','$AUTHOR','PUBLISHED') returning 1) select count(*) from l;")" "USER inserting a PUBLISHED lesson"
refused "$(as authenticated "$OTHER" "with m as (insert into public.modules (course_id,title) values ('$COURSE','Hack') returning 1) select count(*) from m;")" "stranger adding a module to someone else's course"

echo "== 6. Author submits the course"
check "the one unsent lesson moves to SUBMITTED" "1" "$(as authenticated "$AUTHOR" "with u as (update public.lessons set status='SUBMITTED' where course_id='$COURSE' and status in ('DRAFT','CHANGES_REQUESTED') returning 1) select count(*) from u;")"
check "course moved to SUBMITTED" "1" "$(as authenticated "$AUTHOR" "with u as (update public.courses set status='SUBMITTED' where id='$COURSE' returning 1) select count(*) from u;")"
refused "$(as authenticated "$AUTHOR" "with u as (update public.courses set status='PUBLISHED' where id='$COURSE' returning 1) select count(*) from u;")" "author self-publishing the course"
refused "$(as authenticated "$AUTHOR" "with u as (update public.lessons set status='PUBLISHED' where id='$L1' returning 1) select count(*) from u;")" "author self-publishing a lesson"

echo "== 7. Moderator publishes the course and its lessons"
check "course published by moderator" "1" "$(as authenticated "$MOD" "with u as (update public.courses set status='PUBLISHED', published_at=now(), reviewer_id='$MOD' where id='$COURSE' returning 1) select count(*) from u;")"
check "two lessons published" "2" "$(as authenticated "$MOD" "with u as (update public.lessons set status='PUBLISHED', published_at=now(), reviewer_id='$MOD' where course_id='$COURSE' and status='SUBMITTED' returning 1) select count(*) from u;")"
check "anon now sees the course" "PUBLISHED" "$(as anon "" "select status from public.courses where id='$COURSE';")"
check "anon sees 2 lessons"      "2" "$(as anon "" "select count(*) from public.lessons;")"
check "anon sees the module"     "1" "$(as anon "" "select count(*) from public.modules;")"

echo "== 8. Author is promoted to CREATOR"
refused "$(as authenticated "$AUTHOR" "with u as (update public.profiles set role='ADMIN' where id='$AUTHOR' returning 1) select count(*) from u;")" "USER editing their own role column"
root "set local role service_role; update public.profiles set role='CREATOR' where id='$AUTHOR' and role='USER';" >/dev/null
check "service role promoted the author" "CREATOR" "$(root "select role from public.profiles where id='$AUTHOR';")"

echo "== 9. Adding a lesson to the LIVE course"
L3=$(as authenticated "$AUTHOR" "with l as (insert into public.lessons (course_id,slug,title,author_id,status,position) values ('$COURSE','kredit','Kredit','$AUTHOR','SUBMITTED',2) returning id) select id from l;")
check "new lesson queued" "1" "$(echo "$L3" | grep -c '^[0-9a-f-]\{36\}$')"
check "course stays PUBLISHED"  "PUBLISHED" "$(as anon "" "select status from public.courses where id='$COURSE';")"
check "anon still sees only 2"  "2" "$(as anon "" "select count(*) from public.lessons;")"
check "queue finds the course"  "1" "$(as authenticated "$MOD" "select count(distinct course_id) from public.lessons where status='SUBMITTED';")"

echo "== 10. Moderator returns it with a note"
check "lesson returned" "1" "$(as authenticated "$MOD" "with u as (update public.lessons set status='CHANGES_REQUESTED', review_note='Misollar qoshing', reviewer_id='$MOD' where id='$L3' returning 1) select count(*) from u;")"
check "author sees the note" "Misollar qoshing" "$(as authenticated "$AUTHOR" "select review_note from public.lessons where id='$L3';")"

echo "== 11. Author fixes and resubmits"
check "author may edit a returned lesson" "1" "$(as authenticated "$AUTHOR" "with u as (update public.lessons set title='Kredit asoslari', status='SUBMITTED' where id='$L3' returning 1) select count(*) from u;")"
refused "$(as authenticated "$AUTHOR" "with u as (update public.lessons set title='hack' where id='$L1' returning 1) select count(*) from u;")" "author editing a PUBLISHED lesson"
refused "$(as authenticated "$AUTHOR" "with u as (update public.courses set title='hack' where id='$COURSE' returning 1) select count(*) from u;")" "author editing a PUBLISHED course"
refused "$(as authenticated "$AUTHOR" "with d as (delete from public.lessons where id='$L1' returning 1) select count(*) from d;")" "author deleting a PUBLISHED lesson"
refused "$(as authenticated "$OTHER" "with u as (update public.lessons set title='hack' where id='$L3' returning 1) select count(*) from u;")" "stranger editing someone else's lesson"
refused "$(as anon "" "with c as (insert into public.courses (slug,title,author_id) values ('anon','Anon','$AUTHOR') returning 1) select count(*) from c;")" "anon creating a course"

echo "== 12. Admin deletes the course"
root "update public.profiles set role='ADMIN' where id='$MOD';" >/dev/null
refused "$(as authenticated "$OTHER" "with d as (delete from public.courses where id='$COURSE' returning 1) select count(*) from d;")" "a plain user deleting the course"
check "admin deleted the course" "1" "$(as authenticated "$MOD" "with d as (delete from public.courses where id='$COURSE' returning 1) select count(*) from d;")"
check "lessons cascaded" "0" "$(root "select count(*) from public.lessons;")"
check "modules cascaded" "0" "$(root "select count(*) from public.modules;")"

echo
echo "passed: $PASS   failed: $FAIL"
exit $((FAIL > 0))
