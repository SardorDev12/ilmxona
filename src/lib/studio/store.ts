/**
 * localStorage-backed store shaped for useSyncExternalStore.
 *
 * Drafts live in the browser until the content backend exists. Two things
 * this has to get right:
 *
 * - getSnapshot is called on every render and compared by reference, so
 *   the parsed value is cached against the raw string it came from.
 *   Re-parsing would hand back a new object each time and loop forever.
 * - The `storage` event only fires in *other* tabs, so writes also emit a
 *   local event to notify subscribers on this page.
 *
 * Reads and writes are guarded: storage throws in private mode and some
 * embedded browsers, and a half-written value shouldn't take the editor
 * down.
 */
export function createLocalStore<T>(
  key: string,
  serverValue: T,
  revive: (parsed: unknown) => T = (parsed) => parsed as T,
) {
  const LOCAL_EVENT = `ilmxona-store:${key}`;

  let cachedRaw: string | null = null;
  let cached: T = serverValue;

  function read(): T {
    let raw: string | null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      return serverValue;
    }

    if (raw !== cachedRaw) {
      cachedRaw = raw;
      try {
        cached = raw ? revive(JSON.parse(raw)) : serverValue;
      } catch {
        cached = serverValue;
      }
    }

    return cached;
  }

  /** No localStorage during prerender, so the server starts from nothing. */
  function readServer(): T {
    return serverValue;
  }

  function subscribe(onChange: () => void) {
    window.addEventListener("storage", onChange);
    window.addEventListener(LOCAL_EVENT, onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener(LOCAL_EVENT, onChange);
    };
  }

  function write(value: T): boolean {
    try {
      const raw = JSON.stringify(value);
      window.localStorage.setItem(key, raw);
      cachedRaw = raw;
      cached = value;
      window.dispatchEvent(new Event(LOCAL_EVENT));
      return true;
    } catch {
      return false;
    }
  }

  function clear() {
    try {
      window.localStorage.removeItem(key);
      cachedRaw = null;
      cached = serverValue;
      window.dispatchEvent(new Event(LOCAL_EVENT));
    } catch {
      // Nothing to do — the value simply stays where it is.
    }
  }

  return { read, readServer, subscribe, write, clear };
}
