"use client";

import { useState } from "react";
import { cta, demo } from "@/config";
import { asset } from "@/lib/asset";
import styles from "./Demo.module.css";

/**
 * Band 1.5. The single product demo.
 *
 * NO HEADING. There is no heading string for this band and rule 1 says stop
 * and ask rather than invent one.
 *
 * ---------------------------------------------------------------------------
 * CLICK-TO-PLAY FACADE, not a bare embed.
 *
 * Until someone presses play this band is one same-origin JPEG and a button.
 * The YouTube iframe is created on that click and not before. A plain
 * <iframe src="youtube.com/embed/..."> would pull roughly a megabyte of
 * third-party JavaScript into every page load, set cookies before the visitor
 * has interacted with anything, and become comfortably the heaviest thing on
 * a page whose whole pitch is that the product feels fast.
 *
 * The poster is served from our own origin rather than hotlinked from
 * i.ytimg.com, so first paint costs no third-party round trip and leaks no
 * referrer. `youtube-nocookie.com` for the embed itself.
 *
 * The 16:9 box is declared with `aspect-ratio`, so swapping the poster for
 * the iframe cannot reflow the page — the frame is already exactly the size
 * the player will be.
 *
 * If `demo.youtubeId` is ever nulled the band falls back to the designed
 * coming-soon state rather than to an empty frame.
 * ---------------------------------------------------------------------------
 */
export default function Demo() {
  const [playing, setPlaying] = useState(false);
  const hasVideo = demo.youtubeId !== null;

  return (
    <section id="demo" data-tone="light" className={styles.demo}>
      <div className={`u-wrap ${styles.inner}`}>
        <div
          className={styles.frame}
          data-state={hasVideo ? "video" : "pending"}
          data-fx
        >
          <div className={styles.screen}>
            {!hasVideo ? (
              <div className={styles.pending}>
                <PlayGlyph className={styles.pendingGlyph} />
                <span className={styles.pendingChip}>{cta.label}</span>
              </div>
            ) : playing ? (
              <iframe
                className={styles.player}
                /* autoplay is honest here: the visitor just pressed play. */
                src={`https://www.youtube-nocookie.com/embed/${demo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={demo.alt}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                className={styles.facade}
                onClick={() => setPlaying(true)}
                aria-label={demo.alt}
              >
                {/*
                  Plain <img>: static export with images unoptimized, so
                  next/image buys nothing here, and asset() is the one path
                  guaranteed to carry the /forms basePath. Intrinsic
                  dimensions on the element so the box is reserved before the
                  file lands.
                */}
                <img
                  className={styles.poster}
                  src={asset(demo.poster)}
                  alt=""
                  width={1280}
                  height={720}
                  loading="lazy"
                />
                <span className={styles.playButton}>
                  <PlayGlyph className={styles.playGlyph} />
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Same 24px grid as the twelve feature icons, filled rather than stroked. */
function PlayGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9.4 7.8 17 12l-7.6 4.2z" />
    </svg>
  );
}
