import type { HTMLAttributes } from "react";
import { cn } from "@/lib/format";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds the gradient hairline on hover/focus. */
  interactive?: boolean;
  as?: "div" | "section" | "article" | "aside";
}

export function GlassCard({ interactive, as: Tag = "div", className, ...rest }: GlassCardProps) {
  return (
    <Tag
      className={cn("glass rounded-3xl shadow-card", interactive && "gradient-ring", className)}
      {...rest}
    />
  );
}
