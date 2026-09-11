"use client";

import { useEffect, useId, useRef, useState } from "react";
import { WAITLIST_ID } from "@/components/Cta";
import { waitlist } from "@/config";
import styles from "./Waitlist.module.css";

/**
 * Band 5.5. Every "Coming Soon" button on the page scrolls here.
 *
 * NO HEADING, for the same reason the demo band has none: no heading string
 * exists and rule 1 says stop and ask rather than invent one. The field
 * labels, the consent line, the note and the button all come from config.
 *
 * THIS IS THE ONLY THING ON THE PAGE THAT TALKS TO A SERVER, and the page
 * itself stays a fully static export — the post happens client-side, straight
 * to a Google Apps Script web app.
 *
 * Four things about Apps Script that will bite, in roughly this order:
 *
 *  1. CORS. An Apps Script web app does not answer OPTIONS. Posting
 *     `application/json` triggers a preflight, gets nothing back, and fails
 *     with a CORS error that looks exactly like a deploy problem and is not.
 *     URLSearchParams sends `application/x-www-form-urlencoded`, which is a
 *     simple request and never preflights. That is why it is used below.
 *  2. `mode: "no-cors"` is NOT the fix. The request succeeds but the response
 *     goes opaque, so a real failure is indistinguishable from a success and
 *     the visitor gets a confirmation for a submission that never landed.
 *  3. doPost returns a 302 to script.googleusercontent.com. fetch follows it,
 *     which is fine for a simple request.
 *  4. The endpoint is public and has no rate limiting, and there is no CAPTCHA
 *     on this page. Hence the honeypot and the minimum time-to-submit below.
 *     Validate the email in the script too, not just here.
 *
 * The endpoint comes from NEXT_PUBLIC_WAITLIST_ENDPOINT, never from config.ts:
 * Vuk edits config directly and must not be able to break it.
 *
 * PREVIEW MODE: while that variable is unset the form runs end to end and
 * sends nothing, so all three states are demoable before the Apps Script
 * exists. It says so in the console every time. Set the variable before
 * deploying or real submissions will be dropped on the floor.
 */

const ENDPOINT = process.env.NEXT_PUBLIC_WAITLIST_ENDPOINT ?? "";

/** Anything faster than this is not a person filling in four fields. */
const MIN_SUBMIT_MS = 2000;

type State = "idle" | "submitting" | "success" | "error";

export default function Waitlist() {
  const [state, setState] = useState<State>("idle");
  const [consented, setConsented] = useState(false);

  // Stamped in an effect, not during render: Date.now() during render is
  // impure, and the number that matters is when the form reached the browser
  // anyway, not when it was serialised.
  const mountedAt = useRef(0);
  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const uid = useId();
  const noteId = `${uid}-note`;
  const firstId = `${uid}-first`;
  const lastId = `${uid}-last`;
  const emailId = `${uid}-email`;
  const consentId = `${uid}-consent`;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "submitting") return;

    const form = event.currentTarget;
    const data = new FormData(form);

    // Honeypot: hidden from users and from screen readers, so only a bot
    // fills it. Minimum time-to-submit catches the rest. Both are answered
    // with the success state rather than an error — a bot that learns it was
    // caught just comes back tuned, and no real person can trip either.
    const trapped =
      String(data.get("company") ?? "") !== "" ||
      Date.now() - mountedAt.current < MIN_SUBMIT_MS;

    setState("submitting");

    if (trapped) {
      setState("success");
      return;
    }

    const body = new URLSearchParams({
      firstName: String(data.get("firstName") ?? "").trim(),
      lastName: String(data.get("lastName") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      consent: "true",
      source: "mvrk-forms-waitlist",
    });

    if (!ENDPOINT) {
      console.warn(
        "[waitlist] NEXT_PUBLIC_WAITLIST_ENDPOINT is not set. Preview mode: " +
          "nothing was sent.",
        Object.fromEntries(body),
      );
      setState("success");
      return;
    }

    try {
      // No Content-Type header: URLSearchParams sets the one simple-request
      // value fetch is allowed to send without a preflight. Do not "improve"
      // this to application/json.
      const res = await fetch(ENDPOINT, { method: "POST", body });
      if (!res.ok) throw new Error(`Waitlist endpoint returned ${res.status}`);
      setState("success");
    } catch (error) {
      console.error("[waitlist]", error);
      setState("error");
    }
  }

  // The consent line has to carry a live link to the privacy policy, and the
  // string is locked. Split it on the label rather than retyping either half.
  const [beforeLink, afterLink] = waitlist.consent.split(waitlist.privacyLabel);

  return (
    <section id={WAITLIST_ID} data-tone="light" className={styles.band}>
      <div className={`u-wrap u-section ${styles.inner}`}>
        <div className={styles.desc}>
          <p className={`u-label ${styles.descEyebrow}`}>{waitlist.eyebrow}</p>
          <h2 className={`u-display ${styles.descHeading}`}>{waitlist.heading}</h2>
          <p className={`u-body ${styles.descText}`}>{waitlist.description}</p>
        </div>
        <div className={styles.card} data-fx>
          {state === "success" ? (
            // Replaced, not toasted: the form is gone and the confirmation is
            // what stands in its place.
            <div className={styles.done} role="status">
              <p className={`u-display ${styles.doneTitle}`}>
                {waitlist.successTitle}
              </p>
              <p className={styles.doneBody}>{waitlist.successBody}</p>
            </div>
          ) : (
            <form className={styles.form} onSubmit={onSubmit} noValidate={false}>
              {/* Honeypot. aria-hidden + tabIndex -1 keeps it away from
                  keyboard and screen-reader users entirely. */}
              <div className={styles.trap} aria-hidden="true">
                <label htmlFor={`${uid}-company`}>Company</label>
                <input
                  id={`${uid}-company`}
                  name="company"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor={firstId}>
                    {waitlist.firstName}
                  </label>
                  <input
                    className={styles.input}
                    id={firstId}
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor={lastId}>
                    {waitlist.lastName}
                  </label>
                  <input
                    className={styles.input}
                    id={lastId}
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor={emailId}>
                  {waitlist.email}
                </label>
                <input
                  className={styles.input}
                  id={emailId}
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                />
              </div>

              <div className={styles.consent}>
                <input
                  className={styles.check}
                  id={consentId}
                  name="consent"
                  type="checkbox"
                  checked={consented}
                  onChange={(e) => setConsented(e.target.checked)}
                  aria-describedby={noteId}
                  required
                />
                <label className={styles.consentText} htmlFor={consentId}>
                  {beforeLink}
                  <a
                    className={styles.privacy}
                    href={waitlist.privacyHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {waitlist.privacyLabel}
                  </a>
                  {afterLink}
                </label>
              </div>

              <button
                className={styles.submit}
                type="submit"
                disabled={!consented || state === "submitting"}
              >
                {state === "submitting" ? waitlist.submitting : waitlist.submit}
              </button>

              <p className={styles.note} id={noteId}>
                {waitlist.note}
              </p>

              {state === "error" ? (
                <p className={styles.error} role="alert">
                  {waitlist.errorBody}{" "}
                  <a
                    className={styles.privacy}
                    href={`mailto:${waitlist.errorEmail}`}
                  >
                    {waitlist.errorEmail}
                  </a>
                </p>
              ) : null}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
