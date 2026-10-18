import Link from "next/link";

/** Logo: a small swing-tag with a punched hole, echoing the price tags. */
export function BrandMark() {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="UMarket home">
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
        <defs>
          <linearGradient id="brand-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#34d399" />
            <stop offset="0.5" stopColor="#22d3ee" />
            <stop offset="1" stopColor="#a78bfa" />
          </linearGradient>
          <mask id="brand-hole">
            <rect width="32" height="32" fill="#fff" />
            <circle cx="10" cy="16" r="2.6" fill="#000" />
          </mask>
        </defs>
        <path
          d="M4 16 11 5h15a3 3 0 0 1 3 3v16a3 3 0 0 1-3 3H11L4 16Z"
          fill="url(#brand-g)"
          mask="url(#brand-hole)"
          className="origin-[10px_16px] transition-transform duration-500 group-hover:-rotate-6"
        />
      </svg>
      <span className="font-display text-lg font-extrabold tracking-tight text-fg">
        U<span className="text-muted">Market</span>
      </span>
    </Link>
  );
}
