import { FlaskConical } from "lucide-react";

/** Shown only while Firebase keys are missing, so a fresh clone still demos well. */
export function SetupBanner() {
  return (
    <div className="glass flex items-start gap-3 rounded-2xl border-reserved/30 bg-reserved/8 px-4 py-3 text-sm text-fg">
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-reserved" aria-hidden />
      <p>
        <strong className="font-semibold">Demo mode.</strong> You&apos;re seeing sample listings. Add your Firebase keys to{" "}
        <code className="rounded bg-line px-1 py-0.5 text-[13px]">.env.local</code> to go live with sign-in and
        real-time sync.
      </p>
    </div>
  );
}
