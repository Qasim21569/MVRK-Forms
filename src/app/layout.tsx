import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono, Outfit } from "next/font/google";
import ScrollFxProvider from "@/components/ScrollFxProvider";
import Intro from "@/components/intro/Intro";
import {
  EXIT_MS,
  INTRO_RELEASE_EVENT,
  INTRO_STORAGE_KEY,
  RELEASE_MS,
  TOTAL_MS,
} from "@/lib/intro";
import { asset } from "@/lib/asset";
import { brand, site } from "@/config";
import "./globals.css";

/**
 * Type system.
 *
 *   Display  Outfit             next/font/google, variable
 *   Body     Neue Montreal      next/font/local, woff2 from src/fonts/
 *   Labels   JetBrains Mono     next/font/google
 *
 * PP RADER IS GONE. It was the display face for three passes and it never
 * read as professional at headline size on this palette; it also brought the
 * self-hosted-commercial-font problem that produced the same "headings render
 * in the system sans" bug three separate ways. Its woff2 files are deleted.
 *
 * Outfit carries every heading. It is a geometric sans whose circular bowls
 * and rounded terminals are close to the FORMS logo's own construction, so
 * the headline and the lockup finally look like the same brand.
 *
 * THREE FACES, NOT FOUR. Instrument Serif was carried for one element — the
 * hero's cycling word — and is gone: two typefaces inside one headline read
 * as a mismatch rather than as a hierarchy. The cycling word is now the same
 * Outfit as the line under it and is distinguished by the brand gradient and
 * instead. A face loaded for a single word is also a face next/font preloads
 * on every page load.
 *
 * EVERY FACE GOES THROUGH next/font, AND THERE IS NO @font-face BLOCK
 * ANYWHERE. next/font fingerprints files into /forms/_next/static/media/,
 * which is the only path that survives `basePath`, and emits a size-adjusted
 * metric fallback so nothing reflows when a face lands. A hand-written
 * @font-face at `/fonts/...` 404s under the basePath. See the banner at the
 * top of globals.css before touching any of this.
 */
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const montreal = localFont({
  variable: "--font-montreal",
  display: "swap",
  src: [
    {
      path: "../fonts/NeueMontreal-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
});

const mono = JetBrains_Mono({
  variable: "--font-jb",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

/*
 * The script below also marks the document as JavaScript-capable, before
 * first paint, by adding `js` to <html>.
 *
 * `[data-fx] { opacity: 0 }` is scoped to `html.js` in globals.css. If the
 * script never runs — JS off, a blocked bundle, a locked-down corporate
 * network, which is exactly Vuk's audience — nothing is hidden and the page
 * is simply the page. Fail open, never fail closed. CLAUDE.md rule 9.
 *
 * The font variables MUST be on <html>, not <body>. globals.css aliases them
 * in a `:root` block, and a custom property is substituted at computed-value
 * time on the element the declaration applies to — so
 * `--font-display: var(--font-outfit)` on `:root` resolves against <html>.
 * With the variables one level down on <body> it resolves to nothing,
 * font-family becomes invalid, and every heading falls back to the system
 * sans. That is defect 1 wearing a third disguise.
 *
 * <html> therefore carries both a React className and a script-written class,
 * hence suppressHydrationWarning: React skips reconciling what it did not
 * write, and the root layout has no state so it never re-renders and never
 * overwrites it. The standard next-themes arrangement.
 */
/**
 * The intro curtain's entire state machine.
 *
 * A BLOCKING INLINE SCRIPT, and that is the whole design. The curtain's motion
 * is CSS keyframes gated on `data-intro`; the only things that need JavaScript
 * are "let the page start" and "remove the sheet". Putting those in the bundle
 * is what broke the first version of this on another project: the sheet
 * appeared at first paint but nothing could move or dismiss it until React had
 * downloaded and hydrated, so on a cold load it sat frozen until the visitor
 * reloaded. Everything the curtain needs ships in the HTML.
 *
 * THE SERVER RENDERS data-intro="skip" AND THIS UPGRADES IT TO "play". That
 * direction is load-bearing. With JavaScript off, a stripped script, or a
 * thrown exception, the page is simply the page rather than a locked screen
 * behind a curtain that can never lift. The outer try/catch ends in the same
 * place. Fail open, never fail closed.
 *
 * Only data-* attributes are touched here, never className — className on
 * <html> is a React prop (it carries the four next/font variables) and
 * mutating it guarantees a hydration mismatch. `js` is the one exception and
 * it is why <html> also carries suppressHydrationWarning.
 *
 * sessionStorage, not localStorage: someone reloading today does not sit
 * through it twice, someone coming back next week sees the brand moment again.
 *
 * TIMINGS MIRROR src/lib/intro.ts, WHICH MIRRORS Intro.module.css.
 * `npm run intro:check` fails the build if they drift apart.
 */
const INTRO_BOOT = `(function(){try{
var d=document.documentElement;
d.classList.add("js");
var played=false;
try{played=sessionStorage.getItem(${JSON.stringify(INTRO_STORAGE_KEY)})==="1"}catch(e){}
if(played||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
d.setAttribute("data-intro","play");
d.setAttribute("data-intro-lock","");
if("scrollRestoration" in history)history.scrollRestoration="manual";
window.scrollTo(0,0);
var fire=function(n){try{document.dispatchEvent(new Event(n))}catch(e){}};
var release=function(){
if(d.hasAttribute("data-intro-released"))return;
d.setAttribute("data-intro-released","");
/* The scroll lock comes off HERE, not in done(). Two reasons, both bugs
   that shipped: the page is cut loose at release, so holding it locked for
   another 540ms is just a page you cannot scroll for no reason — and more
   importantly ScrollFxProvider refreshes ScrollTrigger on this event. With
   html still at overflow:hidden, the document is not scrollable, maxScroll
   computes as 0, and every trigger start collapses to the top of the page.
   That is why the band headings sat out of position until something else
   forced a refresh seconds later. */
d.removeAttribute("data-intro-lock");
fire(${JSON.stringify(INTRO_RELEASE_EVENT)});
};
var done=function(){
if(d.getAttribute("data-intro")==="done")return;
release();
d.setAttribute("data-intro","done");
d.removeAttribute("data-intro-lock");
try{sessionStorage.setItem(${JSON.stringify(INTRO_STORAGE_KEY)},"1")}catch(e){}
};
/* ARM THE TIMERS WHEN THE CSS ANIMATIONS ACTUALLY START, not when this
   script runs.
   This script is in <head> and runs during parse. The curtain's keyframes
   cannot start until the render-blocking stylesheet has loaded AND <Intro/>
   has parsed at the end of <body>. Starting setTimeout here measured from
   the earlier of the two, so on a cold load the JS finished the sequence
   while the CSS was still partway through it — the curtain lifted early and
   the icon's outline phase got cut off. That is exactly the "sometimes it
   loads too fast, sometimes the outline works properly" symptom.
   animationstart on [data-intro-clock] is the exact signal: that element
   carries the one animation with a 0ms delay, so it fires the instant the
   CSS timeline begins and both clocks then run from the same zero.
   THE setTimeout IS NOT BELT AND BRACES, IT IS THE FAIL-OPEN PATH. If
   animations never start — suppressed engine, an embedded webview, a
   stylesheet that failed — nothing would ever arm the timers and the curtain
   would stay up over a page the visitor can never reach. An earlier version
   used requestAnimationFrame here and did exactly that wherever rAF is
   suspended. Whichever fires first wins; the armed flag makes it
   idempotent. */
var tR=0,tD=0,armed=false;
var arm=function(){
if(armed)return;
armed=true;
tR=setTimeout(release,${RELEASE_MS});
tD=setTimeout(done,${TOTAL_MS});
};
var hook=function(){
var el=document.querySelector("[data-intro-clock]");
if(el)el.addEventListener("animationstart",arm,{once:true});
setTimeout(arm,600);
};
if(document.readyState==="loading"){
document.addEventListener("DOMContentLoaded",hook,{once:true});
}else{
hook();
}
var skip=function(){
if(d.getAttribute("data-intro")!=="play")return;
clearTimeout(tR);clearTimeout(tD);
d.setAttribute("data-intro","exit");
release();
setTimeout(done,${EXIT_MS + 10});
};
addEventListener("pointerdown",skip);
addEventListener("keydown",skip);
}catch(e){
try{document.documentElement.setAttribute("data-intro","skip")}catch(e2){}
}})();`;

export const metadata: Metadata = {
  // The site is served from a subpath. Without the /forms here, every
  // relative metadata URL below resolves one directory too high and the OG
  // card 404s — which is exactly how a subpath deploy quietly fails.
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — 100% Salesforce Native Forms`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.legalName }],
  keywords: [
    "Salesforce forms",
    "Salesforce native forms",
    "free Salesforce forms",
    "form builder for Salesforce",
    "Salesforce AppExchange forms",
    "drag and drop form builder",
    "Salesforce Sites forms",
    "MVRK",
  ],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — 100% Salesforce Native Forms`,
    description: site.description,
    url: site.url,
    // NOT routed through asset(): Next resolves a root-relative metadata URL
    // by APPENDING it to metadataBase's path, so `/forms/brand/og.png` here
    // comes out as `mvrk.ca/forms/forms/brand/og.png`. metadataBase already
    // carries the basePath, so this one place wants the bare path.
    images: [{ url: brand.og, width: 1200, height: 630, alt: brand.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — 100% Salesforce Native Forms`,
    description: site.description,
    images: [brand.og],
  },
  alternates: { canonical: site.url },

  /*
   * Declared explicitly and routed through asset(), rather than using the
   * app/icon.png file convention. That convention emits
   * `/forms/icon.png?icon.<hash>.png`, which 404'd on every single load.
   * These are plain files in public/ with a basePath-correct href.
   * DIAGNOSIS.md defect 3.
   */
  icons: {
    icon: [
      { url: asset(brand.favicon), sizes: "any" },
      { url: asset(brand.icon32), type: "image/png", sizes: "32x32" },
      { url: asset(brand.icon192), type: "image/png", sizes: "192x192" },
      { url: asset(brand.icon512), type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: asset(brand.appleIcon), sizes: "180x180" }],
    shortcut: [asset(brand.favicon)],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // The hero ground, which is what the browser chrome sits against on load.
  themeColor: "#cceef3",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning: JS_BOOT adds a class here before hydration.
    <html
      lang="en"
      className={`${outfit.variable} ${montreal.variable} ${mono.variable}`}
      // Server default. INTRO_BOOT upgrades this to "play". Rendering it here
      // means the attribute exists in the SSR HTML, so there is nothing for
      // React to reconcile away — and with no JS it stays "skip" and the
      // curtain is display:none.
      data-intro="skip"
      suppressHydrationWarning
    >
      <head>
        {/* Must stay first in <head>: it runs before anything paints. */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_BOOT }} />
      </head>
      <body>
        <ScrollFxProvider>{children}</ScrollFxProvider>
        {/* Markup only — the motion is CSS and the teardown is INTRO_BOOT
            above, so this renders on the server and needs no hydration. */}
        <Intro />
      </body>
    </html>
  );
}
