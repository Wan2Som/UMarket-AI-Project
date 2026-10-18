"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { AtSign, LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { isValidTelegramHandle, normalizeTelegramHandle } from "@/lib/telegram";
import { isFirebaseConfigured } from "@/lib/firebase";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Field, Input } from "./ui/Input";
import { useToast } from "./ui/Toast";
import { GoogleMark } from "./GoogleMark";

interface AccountModalProps {
  open: boolean;
  onClose: () => void;
  /** Onboarding: shown right after first sign-in, asking only for the Telegram handle. */
  onboarding?: boolean;
}

export function AccountModal({ open, onClose, onboarding }: AccountModalProps) {
  const { user, profile, signIn, signOut, saveTelegram } = useAuth();
  const toast = useToast();
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (open) {
      setHandle(profile?.telegram ?? "");
      setError(null);
    }
  }, [open, profile?.telegram]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const clean = normalizeTelegramHandle(handle);
    if (!isValidTelegramHandle(clean)) {
      setError("Use 5–32 letters, numbers or underscores, starting with a letter. Example: ali_utp");
      return;
    }
    setSaving(true);
    try {
      await saveTelegram(clean);
      toast(`Saved. Buyers will reach you at @${clean}`);
      onClose();
    } catch {
      setError("Couldn't save your username. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function onSignIn() {
    setSigningIn(true);
    try {
      await signIn();
    } catch {
      toast("Google sign-in didn't complete. Try again.", "error");
    } finally {
      setSigningIn(false);
    }
  }

  if (!user) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title="Sign in to sell"
        description="Browsing is open to everyone. Sign in with your Google account to post listings and manage your stall."
      >
        {isFirebaseConfigured ? (
          <Button size="lg" variant="secondary" className="w-full" onClick={onSignIn} loading={signingIn}>
            {!signingIn && <GoogleMark className="h-5 w-5" />}
            Continue with Google
          </Button>
        ) : (
          <p className="rounded-2xl border border-reserved/30 bg-reserved/10 p-4 text-sm text-fg">
            Sign-in turns on once Firebase keys are added to <code className="font-semibold">.env.local</code>. See
            the README for the five-minute setup.
          </p>
        )}
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={onboarding ? "One last step" : "Your account"}
      description={
        onboarding
          ? "Add your Telegram username. Every listing gets a Chat button that opens a conversation with you, so buyers never have to hunt for your contact."
          : undefined
      }
    >
      {!onboarding && (
        <div className="mb-6 flex items-center gap-3">
          {profile?.photoURL ? (
            <Image src={profile.photoURL} alt="" width={44} height={44} className="h-11 w-11 rounded-full" />
          ) : (
            <span className="grid h-11 w-11 place-items-center rounded-full bg-accent/20 font-bold text-accent">
              {profile?.displayName.charAt(0)}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold">{profile?.displayName}</p>
            <p className="truncate text-sm text-muted">{user.email}</p>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <Field label="Telegram username" htmlFor="tg-handle" error={error} hint="Shown on your listings. You can paste @name or a t.me link.">
          <div className="relative">
            <AtSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
            <Input
              id="tg-handle"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="your_username"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-invalid={!!error}
              aria-describedby={error ? "tg-handle-error" : undefined}
              className="pl-10"
            />
          </div>
        </Field>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          {onboarding ? (
            <Button variant="ghost" onClick={onClose}>
              Later
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={async () => {
                await signOut();
                onClose();
                toast("Signed out", "info");
              }}
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sign out
            </Button>
          )}
          <Button type="submit" loading={saving} magnetic>
            Save username
          </Button>
        </div>
      </form>
    </Modal>
  );
}
