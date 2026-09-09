import { cn } from "@/lib/utils";

/**
 * Brand mark. Kept as an inline <img> pointing at the static SVG rather
 * than next/image: it's a vector, so there is nothing to optimize, and
 * this avoids relying on an image-optimization binding on Workers.
 */
export function LogoMark({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.svg"
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0", className)}
    />
  );
}

export function Logo({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2 font-semibold", className)}>
      <LogoMark size={size} />
      <span>Ilmxona</span>
    </span>
  );
}
