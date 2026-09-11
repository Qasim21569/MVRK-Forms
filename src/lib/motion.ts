"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registered once, here. Never call registerPlugin in a component.
gsap.registerPlugin(ScrollTrigger);

/**
 * The page's motion vocabulary.
 *
 * Carried verbatim from mvrk-orbit so MVRK Forms and mvrk.ca/zapier move the
 * same way. Every duration and easing in the codebase must come from this
 * file: consistency across sections is what makes motion read as deliberate
 * rather than assembled.
 *
 * Tune here, not per component, and the whole page moves together.
 */

/** GSAP easing name. Entrances and micro-interactions both use this. */
export const EASE = "power4.out";

/** The same curve for CSS transitions — literally the same curve, not an
    approximation. GSAP's `power4` is quintic and `cubic-bezier(0.22, 1, 0.36, 1)`
    is the standard easeOutQuint bezier. */
export const EASE_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";

/** Mask rises and stroke draws. Decelerates harder than power4 so a word
    arriving from behind a mask lands rather than drifts. */
export const EASE_MASK = "expo.out";

/** The one ease-IN on the page: an element leaving should accelerate away. */
export const EASE_EXIT = "power2.in";

/** Entrance reveals. */
export const DUR_ENTER = 0.7;

/** Hovers, state flips, and the word cycler's exit. */
export const DUR_MICRO = 0.25;

/** Between staggered siblings — sequential to read, not slow. */
export const STAGGER = 0.07;

/** Travel distance on a reveal, in px. Small on purpose: long fade-ups on
 *  every element are the most common way a page reads as amateur. */
export const TRAVEL = 22;

/** ScrollTrigger start position for entrance reveals. */
export const SCROLL_START = "top 82%";

/**
 * The vocabulary as GSAP's own defaults, so a call site that forgets to pass
 * `ease` or `duration` still moves like the rest of the page. Drift starts
 * the first time someone leaves them off.
 */
gsap.defaults({ ease: EASE, duration: DUR_ENTER });

/**
 * Read live, never cached at module scope: a visitor can flip the OS setting
 * mid-session and the next call should see it.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export { gsap, ScrollTrigger };
