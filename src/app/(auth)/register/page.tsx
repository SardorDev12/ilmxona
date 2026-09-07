import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signUpWithPassword, signInWithGoogle } from "../actions";

export const metadata: Metadata = { title: "Ro'yxatdan o'tish" };

export default async function RegisterPage({
  searchParams,
}: PageProps<"/register">) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Hisob yarating</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {Array.isArray(error) ? error[0] : error}
            </p>
          )}

          <form action={signInWithGoogle}>
            <Button type="submit" variant="outline" className="w-full">
              Google orqali ro&apos;yxatdan o&apos;tish
            </Button>
          </form>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            yoki
            <span className="h-px flex-1 bg-border" />
          </div>

          <form action={signUpWithPassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username">Foydalanuvchi nomi</Label>
              <Input id="username" name="username" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Parol</Label>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={8}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Ro&apos;yxatdan o&apos;tish
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Hisobingiz bormi?{" "}
            <Link href="/login" className="font-medium text-primary">
              Kiring
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
