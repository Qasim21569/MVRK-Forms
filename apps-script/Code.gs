/**
 * MVRK Forms — waitlist endpoint
 * ===========================================================================
 *
 * Container-bound Apps Script. It lives inside ONE Google Sheet, reached via
 * that sheet's Extensions → Apps Script. It is not a standalone project and
 * there is no separate script file to hand over: copying the SPREADSHEET
 * (File → Make a copy) is what carries this code with it.
 *
 * Adapted from the MVRK x Zapier "Reach Out" script documented in
 * form-system-audit.md. Same architecture, different field set: that form was
 * name/company/email/message, this one is firstName/lastName/email/consent.
 *
 * ---------------------------------------------------------------------------
 * THIS FILE IS A REFERENCE COPY. THE LIVE CODE IS WHATEVER IS PASTED INTO THE
 * APPS SCRIPT EDITOR.
 *
 * Nothing pushes this to Google — no clasp, no CI. If someone edits the live
 * script and not this file, this file becomes decorative and the next person
 * to read it is misled. Paste changes back here after any live edit.
 * ---------------------------------------------------------------------------
 *
 * THE ONE FACT THAT DECIDES WHO THE EMAIL COMES FROM
 *
 * MailApp.sendEmail() always sends from the Google account that owns the
 * active deployment. There is no "From" setting, and NOTIFY_EMAIL below is the
 * RECIPIENT only. So "who does this appear to come from" is decided entirely
 * by whoever is signed into Google when they run setup() and click Deploy.
 *
 * Get it wrong and everything still works — row lands, email arrives — it just
 * arrives from the wrong person, silently. If it needs to send as Vuk, Vuk has
 * to personally run setup() and create the deployment while signed into his own
 * account. A developer cannot do that half on his behalf.
 * ===========================================================================
 */

/* ------------------------------------------------------------------ */
/* Configuration                                                       */
/* ------------------------------------------------------------------ */

/** Recipient of the notification. NOT the sender — see the banner above. */
const NOTIFY_EMAIL = "vuk@mvrk.ca";

/** Tab name inside the spreadsheet. Created by setup() if missing. */
const SHEET_NAME = "Waitlist Signups";

/** Display name on the From line. The ADDRESS is not configurable. */
const FROM_NAME = "MVRK Forms";

/*
 * Field keys. These are coupled to src/components/sections/Waitlist.tsx by
 * convention and nothing else — there is no shared type between a Next.js app
 * and an Apps Script project. Rename one side and you must rename the other.
 */
const FIELD_FIRST = "firstName";
const FIELD_LAST = "lastName";
const FIELD_EMAIL = "email";
const FIELD_CONSENT = "consent";
const FIELD_SOURCE = "source";

/** Honeypot key. MUST match the hidden input's name in Waitlist.tsx. */
const FIELD_TRAP = "company";

/** Sheet columns, in order. Changing these means changing _rowFor() too. */
const HEADERS = [
  "Timestamp",
  "First name",
  "Last name",
  "Email",
  "Consent",
  "Source",
];

/**
 * A waitlist gets double-clicked and re-submitted in a way a contact form does
 * not, so a repeat address is skipped rather than written twice. The caller
 * still gets {ok:true} — from the visitor's side signing up twice succeeded.
 * Set false to record every submission including repeats.
 *
 * WORTH KNOWING WHILE TESTING: a repeat address is skipped BEFORE the row and
 * BEFORE the email, so re-testing with the same address produces neither. If a
 * test looks like it did nothing at all, try a fresh address first.
 */
const BLOCK_DUPLICATE_EMAILS = true;

/**
 * Diagnostics token. Hitting the /exec URL with ?diag=<this value> reports
 * WHICH spreadsheet and tab this deployment is actually writing to.
 *
 * Behind a token because the endpoint is public: the sheet is still
 * permission-protected, but its name and id are not worth handing to anyone
 * who finds the URL. Set to "" to disable the diagnostic entirely.
 */
const DIAG_TOKEN = "mvrk-diag-7f3a91";

/* ------------------------------------------------------------------ */
/* Entry points                                                        */
/* ------------------------------------------------------------------ */

/**
 * Browser-hittable sanity check. Paste the /exec URL into a tab: if you see
 * {"ok":true,...} the deployment is live and reachable anonymously.
 *
 * This is the check that catches the Workspace "Who has access" mis-click,
 * which 403s here before any of this code runs.
 */
function doGet(e) {
  /*
   * ?diag=<DIAG_TOKEN> answers the only question that matters when rows seem
   * to be missing: WHICH spreadsheet is this deployment bound to, and what is
   * actually in it.
   *
   * It exists because "the email arrived but the sheet is empty" is always the
   * same misunderstanding — the row was written, just somewhere the person
   * looking was not. Rather than reason about it, ask the deployment.
   */
  const token = e && e.parameter ? e.parameter.diag : null;
  if (token && DIAG_TOKEN && token === DIAG_TOKEN) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      return _json({
        ok: false,
        error:
          "No bound spreadsheet. This script is standalone, not attached to a " +
          "Sheet — it cannot write rows. Recreate it via the Sheet's " +
          "Extensions > Apps Script.",
      });
    }
    const tabs = ss.getSheets().map(function (s) {
      return {
        name: s.getName(),
        rows: Math.max(0, s.getLastRow() - 1),
        isTheTargetTab: s.getName() === SHEET_NAME,
      };
    });
    return _json({
      ok: true,
      writingTo: { spreadsheet: ss.getName(), id: ss.getId(), tab: SHEET_NAME },
      tabsInThisSpreadsheet: tabs,
      notifyEmail: NOTIFY_EMAIL,
      duplicateBlocking: BLOCK_DUPLICATE_EMAILS,
    });
  }

  return _json({ ok: true, message: "MVRK Forms waitlist endpoint is ready." });
}

function doPost(e) {
  try {
    const d = _parseBody(e);

    /*
     * Honeypot. Answered with success on purpose: a bot told it was caught
     * comes back tuned. The frontend also refuses anything submitted within
     * 2s of mount, so this only catches what gets past that.
     */
    if (String(d[FIELD_TRAP] || "").trim() !== "") {
      console.log("Honeypot tripped, dropped: " + JSON.stringify(d));
      return _json({ ok: true });
    }

    /*
     * Server-side validation, mirroring the frontend. NOT redundant: the
     * frontend only constrains a browser. This URL is public and anyone can
     * curl it with a crafted body. The two must be kept in step by hand.
     */
    const first = String(d[FIELD_FIRST] || "").trim();
    const last = String(d[FIELD_LAST] || "").trim();
    const email = String(d[FIELD_EMAIL] || "").trim();
    const consent = String(d[FIELD_CONSENT] || "").trim().toLowerCase();
    const source = String(d[FIELD_SOURCE] || "").trim() || "unknown";

    if (first.length < 1) return _json({ ok: false, error: "First name is required." }, 400);
    if (last.length < 1) return _json({ ok: false, error: "Last name is required." }, 400);
    if (!_isEmail(email)) return _json({ ok: false, error: "A valid email is required." }, 400);

    /*
     * Consent is a legal record, not a formality — the checkbox is what the
     * privacy line on the page is promising. A submission without it is
     * refused rather than stored unticked.
     */
    if (consent !== "true" && consent !== "on" && consent !== "yes") {
      return _json({ ok: false, error: "Consent is required." }, 400);
    }

    if (BLOCK_DUPLICATE_EMAILS && _alreadySignedUp(email)) {
      console.log("Duplicate signup ignored: " + email);
      return _json({ ok: true, duplicate: true });
    }

    _appendToSheet([new Date(), first, last, email, "Yes", source]);
    _sendNotification({ first: first, last: last, email: email, source: source });

    return _json({ ok: true });
  } catch (err) {
    console.error(err);
    return _json({ ok: false, error: String(err) }, 500);
  }
}

/* ------------------------------------------------------------------ */
/* Body parsing                                                        */
/* ------------------------------------------------------------------ */

/**
 * The frontend posts URLSearchParams, which fetch sends as
 * application/x-www-form-urlencoded — a "simple request", so the browser skips
 * the CORS preflight.
 *
 * THAT IS LOAD-BEARING. An Apps Script web app does not answer OPTIONS, so
 * posting application/json triggers a preflight that gets nothing back and the
 * request fails with a CORS error that reads exactly like a broken deployment.
 * Do not "improve" the frontend to send JSON.
 *
 * JSON is still parsed here because the sibling MVRK site posts that way with
 * a text/plain content-type (also preflight-free), and one parser that takes
 * both means this file can be lifted to either.
 */
function _parseBody(e) {
  if (e && e.parameter && Object.keys(e.parameter).length > 0) {
    return e.parameter;
  }
  const raw = e && e.postData ? e.postData.contents : "";
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (ignored) {
    const out = {};
    raw.split("&").forEach(function (pair) {
      const bits = pair.split("=");
      if (!bits[0]) return;
      out[decodeURIComponent(bits[0].replace(/\+/g, " "))] = decodeURIComponent(
        (bits[1] || "").replace(/\+/g, " ")
      );
    });
    return out;
  }
}

function _isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

/* ------------------------------------------------------------------ */
/* Sheet                                                               */
/* ------------------------------------------------------------------ */

function _sheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function _appendToSheet(row) {
  const sheet = _sheet();
  sheet.appendRow(row);
  /*
   * Logged so the Executions tab answers "where did that row go" without
   * anyone having to reason about it. Shows up under
   * Apps Script editor > Executions > the doPost run.
   */
  console.log(
    'Appended row ' + sheet.getLastRow() + ' to tab "' + sheet.getName() +
      '" in spreadsheet "' + SpreadsheetApp.getActiveSpreadsheet().getName() + '"'
  );
}

/** Case-insensitive scan of the Email column. */
function _alreadySignedUp(email) {
  const sheet = _sheet();
  const last = sheet.getLastRow();
  if (last < 2) return false;
  const col = HEADERS.indexOf("Email") + 1;
  const values = sheet.getRange(2, col, last - 1, 1).getValues();
  const needle = email.toLowerCase();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim().toLowerCase() === needle) return true;
  }
  return false;
}

/* ------------------------------------------------------------------ */
/* Email                                                               */
/* ------------------------------------------------------------------ */

function _sendNotification(d) {
  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: "MVRK Forms waitlist: " + d.first + " " + d.last,
    body: _buildEmailPlain(d),
    htmlBody: _buildEmailHtml(d),
    /*
     * Reply-To is the SUBMITTER. This is what makes "Reply" in Gmail open a
     * conversation with the lead instead of with yourself.
     */
    replyTo: d.email,
    name: FROM_NAME,
  });
}

function _buildEmailPlain(d) {
  return [
    "New MVRK Forms waitlist signup",
    "",
    "Name:   " + d.first + " " + d.last,
    "Email:  " + d.email,
    "Source: " + d.source,
    "Consent: Yes",
    "",
    "Reply to this email to reach them directly.",
  ].join("\n");
}

/**
 * Fully inline-styled. Gmail, Outlook and Apple Mail all strip <style> blocks,
 * so there is no stylesheet to write. No external images and no webfont — it
 * falls back to the system stack everywhere.
 */
function _buildEmailHtml(d) {
  const row = function (label, value) {
    return (
      '<tr>' +
      '<td style="padding:6px 16px 6px 0;color:#5E5E5E;font-size:13px;white-space:nowrap;vertical-align:top;">' +
      esc(label) +
      "</td>" +
      '<td style="padding:6px 0;color:#4B5B71;font-size:15px;font-weight:500;">' +
      value +
      "</td>" +
      "</tr>"
    );
  };

  return (
    '<div style="margin:0;padding:24px;background:#F6F0E6;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;">' +
    '<table role="presentation" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#FBF8F3;border:1px solid rgba(75,91,113,0.14);border-radius:12px;">' +
    "<tr><td style=\"padding:24px 24px 8px;\">" +
    '<p style="margin:0 0 4px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#814D71;">MVRK Forms</p>' +
    '<p style="margin:0;font-size:20px;font-weight:700;color:#4B5B71;">New waitlist signup</p>' +
    "</td></tr>" +
    '<tr><td style="padding:8px 24px 24px;">' +
    '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">' +
    row("Name", esc(d.first + " " + d.last)) +
    row(
      "Email",
      '<a href="mailto:' + esc(d.email) + '" style="color:#814D71;">' + esc(d.email) + "</a>"
    ) +
    row("Source", esc(d.source)) +
    row("Consent", "Yes") +
    "</table>" +
    '<p style="margin:18px 0 0;font-size:13px;color:#5E5E5E;">Reply to this email to reach them directly.</p>' +
    "</td></tr>" +
    "</table>" +
    "</div>"
  );
}

/**
 * The one place unescaped input could inject markup — into the notification
 * email itself. Everything interpolated into the HTML above goes through here.
 */
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ------------------------------------------------------------------ */
/* Response                                                            */
/* ------------------------------------------------------------------ */

/**
 * TEXT rather than JSON mime, deliberately. Apps Script answers a JSON mime
 * type with a redirect the caller then has to follow; the frontend only reads
 * the status code, so plain text keeps the hop count down.
 */
function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.TEXT
  );
}

/* ------------------------------------------------------------------ */
/* Setup                                                               */
/* ------------------------------------------------------------------ */

/**
 * RUN THIS ONCE, BY HAND, FROM THE APPS SCRIPT EDITOR. It is never called by
 * doPost.
 *
 * Creating the tab and the header row is the visible half. The real job is the
 * invisible half: running it is what triggers Google's one-time OAuth consent
 * screen, which grants this script permission to touch Sheets and send Mail AS
 * THE SIGNED-IN ACCOUNT. That consent — not anything in this file — is what
 * decides whose address the notifications come from.
 *
 * Expect "Google hasn't verified this app" on the way through. That is normal
 * for a private script: Advanced → Go to [project] (unsafe) → Allow.
 */
function setup() {
  const sheet = _sheet();
  SpreadsheetApp.getActiveSpreadsheet().toast(
    'Ready. Tab "' + SHEET_NAME + '" has ' + (sheet.getLastRow() - 1) + " signup(s)."
  );
}
