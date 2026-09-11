"use client";

import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "./motion";

/**
 * The single Lenis instance for the page, and the single place it is tied to
 * GSAP. Nothing else should import Lenis directly.
 *
 * Lenis advances its own RAF; we hijack the gsap.ticker so there is one
 * heartbeat for the whole page. On each tick Lenis rafs, then ScrollTrigger
 * updates from the new scroll position.
 *
 * Reduced motion: Lenis is not created at all, native scroll is used so the
 * page still works without smoothing.
 *
 * Carried from mvrk-orbit, minus the intro-curtain handshake. This page has
 * no preloader.
 */

let lenis: Lenis | null = null;

/**
 * Ease the page to an absolute Y position. Routes through Lenis when it is
 * running, and falls back to a native jump when it is not.
 *
 * This is the ONLY way anything on the page moves the scroll position. A bare
 * `window.scrollTo` fights Lenis: Lenis keeps animating toward its own target
 * and drags the page straight back. CLAUDE.md rule 2.
 */
export function scrollToY(y: number): void {
  const top = Math.max(0, y);
  if (lenis) {
    lenis.scrollTo(top, { duration: 0.9 });
    return;
  }
  // Reduced motion, or the bundle is mid-flight. A jump is the right answer
  // in both cases.
  if (typeof window !== "undefined") window.scrollTo({ top, behavior: "auto" });
}

/**
 * Ease the page to an element, offset clear of the fixed nav.
 *
 * Every "Coming Soon" button on the page ends here. The label does not change
 * and nothing installs; the button just gives the click somewhere to go.
 */
export function scrollToId(id: string, offset = 0): void {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return;
  scrollToY(el.getBoundingClientRect().top + window.scrollY - offset);
}

export function initSmoothScroll(): () => void {
  if (prefersReducedMotion() || typeof window === "undefined") return () => {};

  /*
   * duration 1.1, not higher. Above about 1.2 the page keeps gliding for
   * half a second after the wheel stops, and that drift is the single most
   * common way smooth scroll makes a site feel cheap. One wheel click should
   * move ~100-120px and come to rest inside 400ms.
   *
   * If the trackpad ever feels slippery, drop wheelMultiplier before touching
   * duration.
   */
  const instance = new Lenis({
    duration: 1.1,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.6,
  });
  lenis = instance;

  // One heartbeat: Lenis rafs, then ScrollTrigger catches up.
  const onTick = (time: number) => {
    instance.raf(time * 1000);
    ScrollTrigger.update();
  };
  gsap.ticker.add(onTick);
  gsap.ticker.lagSmoothing(0);

  // Anchor links route through Lenis so they ease rather than snap.
  const onClick = (e: MouseEvent) => {
    const target = (e.target as HTMLElement)?.closest?.('a[href^="#"]');
    if (!target) return;
    const href = target.getAttribute("href");
    if (!href || href === "#") return;
    const el = document.querySelector(href);
    if (!el) return;
    e.preventDefault();
    instance.scrollTo(el as HTMLElement, { offset: -80, duration: 1.2 });
  };
  document.addEventListener("click", onClick);

  // Fonts and images landing after first paint shift scroll positions; refresh
  // so every trigger recomputes against the real layout.
  const refresh = () => ScrollTrigger.refresh();

  // On a warm cache this can initialise AFTER `load` has already fired, and
  // then the listener never runs — every trigger position stays computed
  // against pre-image layout. Check the state instead of assuming.
  // REVIEW.md C4.1.
  if (document.readyState === "complete") refresh();
  else window.addEventListener("load", refresh);

  // PP Rader is a heavy display face set at up to 128px. When it swaps in,
  // every heading below it moves and all the start positions go stale.
  // REVIEW.md C4.2.
  let fontsAlive = true;
  document.fonts?.ready.then(() => {
    if (fontsAlive) refresh();
  });

  return () => {
    fontsAlive = false;
    gsap.ticker.remove(onTick);
    // Restore GSAP's shipped default rather than leaving lag smoothing off
    // for whatever mounts next. REVIEW.md C4.3.
    gsap.ticker.lagSmoothing(1000, 33);
    document.removeEventListener("click", onClick);
    window.removeEventListener("load", refresh);
    instance.destroy();
    if (lenis === instance) lenis = null;
  };
}
