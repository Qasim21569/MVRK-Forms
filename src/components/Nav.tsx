"use client";

import { useEffect, useState } from "react";
import Cta from "./Cta";
import { brand } from "@/config";
import { asset } from "@/lib/asset";
import styles from "./Nav.module.css";

/**
 * Band 0. Logo left, one button right, nothing else — there is nowhere else
 * to go, so there are no nav links.
 *
 * The cream wash and hairline are permanent — see Nav.module.css for why the
 * transparent-over-hero state was dropped. The only thing `lifted` changes is
 * height, 76px to 60px, once you are past the fold. That is effect 5 of the
 * page's five, and it is a state change rather than a loop: the word cycler
 * stays the only thing that runs forever.
 */
export default function Nav() {
  const [lifted, setLifted] = useState(false);

  useEffect(() => {
    // Lenis scrolls the window natively, so a plain passive scroll listener
    // sees every frame without needing to know Lenis exists.
    //
    // HYSTERESIS, and it is not optional. With a single threshold the nav
    // toggles on every frame the visitor hovers near it — and it is
    // transitioning height, background and a backdrop-filter over 0.7s, so a
    // toggle right on the boundary reads as the header flickering. Shrink at
    // 0.65 of a viewport, grow back at 0.5, and the two never meet.
    const onScroll = () =>
      setLifted((prev) => {
        const y = window.scrollY;
        const vh = window.innerHeight;
        return prev ? y > vh * 0.5 : y > vh * 0.65;
      });
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`${styles.nav} ${lifted ? styles.lifted : ""}`}>
      <div className={`u-wrap ${styles.inner}`}>
        {/*
          Plain <img>, not next/image: this is a static export with
          `images: { unoptimized: true }`, so next/image buys nothing here and
          `asset()` is the one path that is guaranteed to carry the /forms
          basePath. Intrinsic width/height are on the element so the row
          reserves its space before the file lands — no layout shift.
        */}
        <img
          className={styles.lockup}
          src={asset(brand.lockup)}
          alt={brand.alt}
          width={720}
          height={190}
          fetchPriority="high"
        />
        <Cta variant="nav" />
      </div>
    </header>
  );
}
