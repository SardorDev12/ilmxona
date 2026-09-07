import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

const VARIANT_CLASSES = {
  default: "bg-muted text-foreground",
  primary: "bg-primary text-primary-foreground",
  accent: "bg-accent text-accent-foreground",
  outline: "border border-border text-foreground",
} as const;

type BadgeProps = ComponentProps<"span"> & {
  variant?: keyof typeof VARIANT_CLASSES;
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    />
  );
}
