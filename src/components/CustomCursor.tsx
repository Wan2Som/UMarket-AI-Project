"use client";

import { useEffect, useRef } from "react";

/**
 * Trailing glow + ring that follows the pointer. The ring grows over
 * interactive elements (links, buttons, [data-cursor]) and elements marked
 * [data-magnetic] lean slightly toward the pointer. Colour comes from the
 * --cursor-rgb theme token, so it adapts to light and dark mode.
 *
 * Disabled on touch screens and when the user prefers reduced motion.
 * The native cursor stays visible, so nothing depends on this effect.
 */
const INTERACTIVE = "a, button, [role='radio'], [data-cursor], input[type='file'], label[for]";
const MAGNET_STRENGTH = 0.22;
const MAGNET_MAX = 8;

export function CustomCursor() {
  const glowRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const glow = glowRef.current;
    const ring = ringRef.current;
    if (!fine || reduced || !glow || !ring) return;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const glowPos = { ...target };
    const ringPos = { ...target };
    let magnet: HTMLElement | null = null;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      glow.classList.remove("cursor-hidden");
      ring.classList.remove("cursor-hidden");

      const el = e.target instanceof Element ? e.target : null;
      ring.classList.toggle("is-hover", !!el?.closest(INTERACTIVE));

      const m = el?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (magnet && magnet !== m) magnet.style.transform = "";
      magnet = m;
      if (magnet) {
        const r = magnet.getBoundingClientRect();
        const dx = Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, (e.clientX - (r.left + r.width / 2)) * MAGNET_STRENGTH));
        const dy = Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, (e.clientY - (r.top + r.height / 2)) * MAGNET_STRENGTH));
        magnet.style.transform = `translate(${dx}px, ${dy}px)`;
      }
    };
    const onLeave = () => {
      glow.classList.add("cursor-hidden");
      ring.classList.add("cursor-hidden");
      if (magnet) magnet.style.transform = "";
      magnet = null;
    };
    const onDown = () => ring.classList.add("is-down");
    const onUp = () => ring.classList.remove("is-down");

    const tick = () => {
      glowPos.x += (target.x - glowPos.x) * 0.08;
      glowPos.y += (target.y - glowPos.y) * 0.08;
      ringPos.x += (target.x - ringPos.x) * 0.28;
      ringPos.y += (target.y - ringPos.y) * 0.28;
      glow.style.transform = `translate3d(${glowPos.x}px, ${glowPos.y}px, 0)`;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      if (magnet) magnet.style.transform = "";
    };
  }, []);

  return (
    <>
      <div ref={glowRef} className="cursor-glow cursor-hidden" aria-hidden />
      <div ref={ringRef} className="cursor-ring cursor-hidden" aria-hidden />
    </>
  );
}
