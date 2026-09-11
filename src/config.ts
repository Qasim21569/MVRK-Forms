/**
 * MVRK Forms — single source of truth for every word on the page.
 *
 * Transcribed from Vuk's wireframe annotations, September 2026.
 * Copy is LOCKED. Do not rewrite, shorten, or improve any string here.
 * Never hardcode a string in a component.
 *
 * Vuk edits this file directly to change content without a developer.
 *
 * The waitlist ENDPOINT is deliberately NOT in this file. It lives in
 * NEXT_PUBLIC_WAITLIST_ENDPOINT so an edit here can never break the form.
 */

export const site = {
  name: "MVRK Forms",
  legalName: "MVRK Inc.",
  tagline: "100% Native. 100% Free. Built for Salesforce.",
  /** Confirmed 06/09/26. Static export served from the /forms subpath. */
  url: "https://www.mvrk.ca/forms",
  description:
    "100% Salesforce Native Forms. Free Forever! Build, brand and automate forms without your data ever leaving Salesforce.",
} as const;

/**
 * Every install call to action on the page is this one button.
 *
 * The product is pre-launch, so the button installs nothing: it renders
 * `label` and scrolls the page down to the waitlist form. At launch, swap
 * `label` for `futureLabel` and point `futureHref` at the AppExchange
 * listing. Nothing else changes.
 *
 * The waitlist form's own submit is the only real action on the page.
 */
export const cta = {
  label: "Coming Soon",
  futureLabel: "Install For Free",
  footerFutureLabel: "Install Now — Free",
  href: null,
  /** 02/07/26 Vuk: "will eventually lead to the official Salesforce app
   *  exchange listing". Not wired now. One line to flip at launch. */
  futureHref: null as string | null,
} as const;

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export const hero = {
  /**
   * Line 1 cycles through these 46 words, in this exact order, then loops.
   *
   * "Free" recurs eleven times as the anchor, roughly every fourth word.
   * That repetition IS the pitch: the headline keeps saying the product is
   * free without a single hard sell. Do not dedupe, shuffle, or reorder.
   */
  words: [
    "Free", "Fantastic", "Funky", "Flawless",
    "Free", "Fancy", "Fun", "Fresh",
    "Free", "Fluid", "Fierce", "Friendly",
    "Free", "Frictionless", "Fast", "Flexible",
    "Free", "Familiar", "Fearless", "Focused",
    "Free", "Foolproof", "Feisty", "Fabulous",
    "Free", "Flashy", "Fly", "Fire",
    "Free", "Formidable", "Forever", "Festive",
    "Free", "Fabled", "Finest", "First",
    "Free", "Functional", "Forge", "Freestyle",
    "FTW", "Fitting",
    "Free", "Footloose", "Fortified", "Frontline",
  ],

  /** Shown instead of the cycler under prefers-reduced-motion. */
  staticWord: "Fast",

  /** Line 2. Static, set in the rose-to-plum gradient. */
  line2: "Forms For Salesforce",

  subhead: "100% Salesforce Native Forms. Free Forever!",

  /**
   * ms each word holds before the next one enters. MOTION.md section 4.
   *
   * NOTE, worth one line to Vuk: on 02/07/26 he said "I think even 1.5 second
   * may be too long", which is where the previous 1200 came from. MOTION.md
   * specifies 1600 and is the newer spec, so 1600 is what ships. It is one
   * number in this file either way.
   */
  dwellMs: 1600,

  /**
   * ms before the FIRST swap. Deliberately shorter than a full dwell: the
   * hero has just finished performing at ~1.2s and the cycler picking up
   * immediately is what tells the visitor the line is alive.
   */
  firstSwapMs: 1400,
} as const;

/**
 * The hero's form-card mockup.
 *
 * These are NOT page copy — they are the labels inside a picture of a form,
 * the way a screenshot in a pitch deck has labels. The card is aria-hidden and
 * none of this is read out.
 *
 * They live here anyway, because rule 1 says never hardcode a string in a
 * component, and because Vuk should be able to see what the mockup claims and
 * change it. Set any of them to "" to render a blank bar instead.
 *
 * When the real product screenshot lands, this whole block goes.
 */
export const heroCard = {
  title: "Client Intake",
  badge: "Live",
  fields: ["Full Name", "Work Email", "How Did You Hear About Us"],
  submit: "Submit",
} as const;

/* ------------------------------------------------------------------ */
/* Demo — the single product video, its own band under the hero        */
/* ------------------------------------------------------------------ */

/**
 * The single product demo. Its own band, between Hero and Creative Design.
 *
 * DELIVERED 11/09/26, as a YouTube video rather than the self-hosted MP4 the
 * original spec assumed. So the band is a click-to-play facade: the poster and
 * a play control are ours, and YouTube's player is only loaded once someone
 * actually asks for it.
 *
 * That is not a shortcut, it is the point. A bare YouTube <iframe> pulls
 * roughly a megabyte of third-party JavaScript into every single page load,
 * sets cookies before the visitor has touched anything, and would be the
 * heaviest thing on a page whose entire pitch is that the product feels fast.
 *
 * The poster is downloaded and served from our own origin, not hotlinked from
 * i.ytimg.com: an external image request on first paint is a third-party
 * round trip we do not control and a referrer we do not need to leak.
 *
 * The embed uses youtube-nocookie.com.
 */
export const demo = {
  /** YouTube video id. Null falls back to the designed placeholder state. */
  youtubeId: "Y7ZDRdq3ZuE" as string | null,
  /** 1280x720, from the video's own maxres thumbnail, re-encoded. */
  poster: "/media/demo-poster.jpg",
  /** Accessible name for the play control, and the frame's title. */
  alt: "Building a form in MVRK Forms inside Salesforce",
} as const;

/* ------------------------------------------------------------------ */
/* Feature bands                                                       */
/* ------------------------------------------------------------------ */

export type IconName =
  | "mouse"
  | "speech-bubble"
  | "palette"
  | "flow-chart"
  | "gear"
  | "chain-link"
  | "cloud"
  | "checkbox"
  | "arrow-right"
  | "magnifier"
  | "funnel"
  | "tray";

export type FeatureItem = {
  icon: IconName;
  title: string;
  subtitle: string;
};

export type FeatureBand = {
  id: string;
  /**
   * The numbered label above the heading. The ONLY new text on the page, and
   * a label rather than copy. Numbers are earned because this genuinely is a
   * sequence: Build, Think, Share, Collect is one form's life, in the order
   * the client wrote it. The number itself is derived from position.
   */
  eyebrow: string;
  heading: string;
  /**
   * The only thing that differs between the four bands, along with whether
   * their items sit in cards. The per-band `rhythm` field is gone: four
   * different compositions produced one band with an empty half and a
   * connector that rendered as stray dots. One layout, four grounds.
   */
  tone: "light" | "plum";
  items: readonly [FeatureItem, FeatureItem, FeatureItem];
};

export const bands: readonly FeatureBand[] = [
  {
    id: "creative-design",
    eyebrow: "BUILD",
    heading: "Creative Design",
    tone: "light",
    items: [
      {
        icon: "mouse",
        title: "Build Intuitively",
        subtitle: "Our drag-and-drop editor lets you create forms easily.",
      },
      {
        icon: "speech-bubble",
        title: "Ask Anything You Wish",
        subtitle:
          "Over 20 question types and form elements give you complete flexibility.",
      },
      {
        icon: "palette",
        title: "Show Your Style",
        subtitle:
          "Align forms to your brand with full control of all design elements.",
      },
    ],
  },
  {
    id: "intelligent-automation",
    eyebrow: "THINK",
    heading: "Intelligent Automation",
    tone: "plum",
    items: [
      {
        icon: "flow-chart",
        title: "Add Dynamic Logic",
        subtitle:
          "Make your forms react to user input with our form rules engine.",
      },
      {
        icon: "gear",
        title: "Automate Simply",
        subtitle:
          "Forget flows, our post-submission automation builder lets responses take action.",
      },
      {
        icon: "chain-link",
        title: "Connect Your Processes",
        subtitle:
          "Eliminate the gap between Salesforce data and the tool that captures it.",
      },
    ],
  },
  {
    id: "secure-sharing",
    eyebrow: "SHARE",
    heading: "Secure Sharing",
    tone: "light",
    items: [
      {
        icon: "cloud",
        title: "Leverage Salesforce Hosting",
        subtitle:
          "Using native Salesforce Sites capabilities gives a simple and secure way to publish your forms.",
      },
      {
        icon: "checkbox",
        title: "Prefill Form Data",
        subtitle:
          "Improve user experience and maintain clean data by leveraging our form prefill tools.",
      },
      {
        icon: "arrow-right",
        title: "Redirect After Response",
        subtitle:
          "Send users to a tailored thank-you page, a connected form, or anywhere you please after form submission!",
      },
    ],
  },
  {
    id: "clean-data",
    eyebrow: "COLLECT",
    heading: "Clean Data",
    tone: "plum",
    items: [
      {
        icon: "magnifier",
        title: "No Reports Needed",
        subtitle:
          "See all form submissions directly in the form record with our native response dashboard.",
      },
      {
        icon: "funnel",
        title: "Sort & Filter",
        subtitle:
          "Drill down to exactly the information you need effortlessly with our built-in functionality.",
      },
      {
        icon: "tray",
        title: "Export With One Click",
        subtitle:
          "Extract the raw submission data as a CSV with no configuration required.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* The org boundary                                                    */
/* ------------------------------------------------------------------ */

/**
 * The page's one big device.
 *
 * The product's actual pitch is not "we have a form builder", it is that the
 * data never leaves Salesforce. No external service, no third-party host, no
 * export step — that is the whole reason an admin picks this over Jotform, and
 * nothing on the page said it visually.
 *
 * So all four bands happen INSIDE a hairline frame labelled here. It is a
 * device, not copy: if Vuk wants the label gone the frame still works
 * unlabelled, and `label: null` is the switch.
 */
export const org = {
  label: "YOUR SALESFORCE ORG" as string | null,
} as const;

/* ------------------------------------------------------------------ */
/* Waitlist                                                            */
/* ------------------------------------------------------------------ */

/**
 * Confirmed 10/09/26. Every "Coming Soon" button on the page scrolls here.
 *
 * `consent` is what Vuk actually wrote for Forms on 04/09/26. `submit` is from
 * the annotated free-book screenshot he sent as the model — the only thing he
 * crossed out on it was the button label.
 */
export const waitlist = {
  /** Field labels, from the table in REVIEW.md A2. */
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email",

  /* --- Band copy -------------------------------------------------------
   * NOT FROM THE WIREFRAME. VUK MUST READ AND OVERWRITE THESE THREE.
   *
   * No heading copy exists for the waitlist band and rule 1 says stop and
   * ask rather than invent. These are placeholders holding the shape of the
   * two-column layout, nothing more. `description` previously read "The only
   * thing on this page that talks to a server", which is a code comment that
   * leaked into user-facing copy.
   * ------------------------------------------------------------------ */
  eyebrow: "The waitlist",
  heading: "Be first when it ships.",
  description:
    "MVRK Forms is not out yet. Leave your details and we will email you " +
    "the day it is.",

  consent:
    "Yes, notify me via email when the trial is available. I agree to the " +
    "Privacy Policy and consent to receive future emails from MVRK.",
  /** TODO: last sentence still references "the book". Confirm with Vuk. */
  note:
    "Note: I hate spam as much as you do. I will only email when I have " +
    "something important to share.",
  submit: "Email Me When Available",
  privacyHref: "https://www.mvrk.ca/privacy-policy",
  /** Rendered inside the consent line as a link. */
  privacyLabel: "Privacy Policy",

  /* --- State copy ---------------------------------------------------
   * NOT from the wireframe: no strings exist for these and REVIEW.md A2
   * requires all three states. Written to be replaceable — Vuk should
   * read these and overwrite them.
   * ------------------------------------------------------------------ */
  submitting: "Sending…",
  successTitle: "You're on the list.",
  successBody: "We'll email you the moment MVRK Forms is available.",
  errorBody:
    "Something went wrong and your details did not send. Try again, or email us at",
  errorEmail: "vuk@mvrk.ca",
} as const;

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

export const footer = {
  /** Same line as site.tagline. Referenced, not retyped, so they cannot drift. */
  tagline: site.tagline,
  copyright: "© 2026 MVRK Inc. All rights reserved.",
} as const;

/* ------------------------------------------------------------------ */
/* Brand assets — delivered 10/09/26                                   */
/* ------------------------------------------------------------------ */

/**
 * Paths are root-relative and MUST be routed through `asset()` in
 * `lib/asset.ts` before they reach the DOM, or they 404 under the /forms
 * basePath. See CLAUDE.md rule 10.
 *
 * These are web-sized derivatives built from Vuk's print-scale originals in
 * `public/FORMS-assets/` by `npm run brand`.
 */
export const brand = {
  /** Favicons and app icons. Declared explicitly in layout.tsx and routed
   *  through asset(), NOT via the app/icon.png file convention — that
   *  convention appends its own cache-busting query and was 404ing on every
   *  load under the basePath. DIAGNOSIS.md defect 3. */
  favicon: "/favicon.ico",
  icon32: "/brand/icon-32.png",
  icon192: "/brand/icon-192.png",
  icon512: "/brand/icon-512.png",
  appleIcon: "/brand/apple-touch-icon.png",
  /** Full lockup, gradient artwork, for light surfaces. */
  lockup: "/brand/lockup-color.png",
  /** Full lockup, white, for the ink footer. */
  lockupWhite: "/brand/lockup-white.png",
  /** Icon only, gradient artwork. */
  icon: "/brand/icon-color.png",
  /** Outline mark recoloured to --plum, used as the demo poster placeholder. */
  markOutline: "/brand/mark-outline-plum.png",
  og: "/brand/og.png",
  /** The lockup's intrinsic aspect ratio, so the nav reserves space for it. */
  lockupRatio: 720 / 190,
  alt: "FORMS by MVRK",
} as const;
