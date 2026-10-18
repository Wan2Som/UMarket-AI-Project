"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/format";

/** Light/dark switch. Renders a neutral placeholder until mounted to avoid a hydration mismatch. */
export function ThemeToggle({ className, withLabel }: { className?: string; withLabel?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = !mounted || resolvedTheme === "dark";
  const next = isDark ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className={cn("group flex flex-col items-center gap-0.5 py-1.5 text-muted transition-colors hover:text-fg", className)}
    >
      <span className={cn("relative grid place-items-center overflow-hidden", withLabel ? "h-5 w-6" : "h-10 w-10 rounded-full")}>
        <Sun
          className={cn(
            "absolute h-[19px] w-[19px] transition-all duration-500",
            isDark ? "translate-y-6 rotate-90 opacity-0" : "translate-y-0 rotate-0 opacity-100",
          )}
          aria-hidden
        />
        <Moon
          className={cn(
            "absolute h-[19px] w-[19px] transition-all duration-500",
            isDark ? "translate-y-0 rotate-0 opacity-100" : "-translate-y-6 -rotate-90 opacity-0",
          )}
          aria-hidden
        />
      </span>
      {withLabel && <span className="text-[11px] font-medium leading-none">{isDark ? "Dark" : "Light"}</span>}
    </button>
  );
}
