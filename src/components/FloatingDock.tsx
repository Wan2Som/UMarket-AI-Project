"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Store, Plus, ClipboardList, UserRound } from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { cn } from "@/lib/format";
import { ThemeToggle } from "./ThemeToggle";
import { AccountModal } from "./AccountModal";

const NAV = [
  { href: "/", label: "Market", icon: Store },
  { href: "/my-listings", label: "My stall", icon: ClipboardList },
];

/**
 * Floating glass dock: the main navigation on every screen size, sized for
 * thumbs on a phone. The Post button sits in the middle as the primary action.
 */
export function FloatingDock() {
  const pathname = usePathname();
  const { user, profile, needsTelegram } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

  const item = (href: string, label: string, Icon: typeof Store) => {
    const active = pathname === href;
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "relative flex w-16 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-medium transition-colors",
          active ? "text-fg" : "text-muted hover:text-fg",
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
        {label}
        {active && <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-accent" />}
      </Link>
    );
  };

  return (
    <>
      <nav
        aria-label="Main"
        className="glass fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-[1.75rem] bg-surface-strong/75 px-2 py-1.5 shadow-float"
      >
        {item(NAV[0].href, NAV[0].label, NAV[0].icon)}

        <Link
          href="/post-item"
          aria-label="Post an item"
          aria-current={pathname === "/post-item" ? "page" : undefined}
          data-magnetic
          className="mx-1 grid h-13 w-13 place-items-center rounded-full bg-gradient-to-br from-emerald-400 via-cyan-400 to-violet-500 text-slate-950 shadow-[0_10px_30px_-8px_rgb(52_211_153/0.7)] transition-[filter] hover:brightness-110"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} aria-hidden />
        </Link>

        {item(NAV[1].href, NAV[1].label, NAV[1].icon)}

        <span className="mx-0.5 h-8 w-px bg-line" aria-hidden />
        <ThemeToggle className="w-12" withLabel />

        <button
          type="button"
          onClick={() => setAccountOpen(true)}
          className="flex w-14 flex-col items-center gap-0.5 py-1.5 text-[11px] font-medium text-muted transition-colors hover:text-fg"
          aria-label={user ? "Account" : "Sign in"}
        >
          <span className="relative">
            {profile?.photoURL ? (
              <Image src={profile.photoURL} alt="" width={22} height={22} className="h-[22px] w-[22px] rounded-full" />
            ) : (
              <UserRound className="h-5 w-5" aria-hidden />
            )}
            {needsTelegram && (
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-reserved ring-2 ring-surface-strong" />
            )}
          </span>
          {user ? "You" : "Sign in"}
        </button>
      </nav>

      <AccountModal open={accountOpen} onClose={() => setAccountOpen(false)} />
      {/* First sign-in: ask for the Telegram handle once per session. */}
      <AccountModal
        open={needsTelegram && !onboardingDismissed && !accountOpen}
        onClose={() => setOnboardingDismissed(true)}
        onboarding
      />
    </>
  );
}
