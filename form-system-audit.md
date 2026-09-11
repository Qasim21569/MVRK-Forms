# Form → Google Apps Script system — full audit

A complete account of how the "Reach Out" form on this site works end to
end, written so the same pattern can be reproduced on a different site for
the same client (or any client). Everything here reflects the system as it
actually exists in this repo as of this audit — not the original plan, the
as-built result, including the mistakes that got made and fixed along the
way.

---

## 1. Architecture, in one picture

```
┌─────────────────┐         POST JSON          ┌──────────────────────────┐
│  ContactForm.tsx │ ─────────────────────────▶ │  Google Apps Script      │
│  (React, client) │   text/plain content-type  │  Web App  (doPost)       │
└─────────────────┘   (avoids CORS preflight)   └───────────┬──────────────┘
                                                             │
                                          ┌──────────────────┴───────────────┐
                                          ▼                                  ▼
                                ┌──────────────────┐            ┌───────────────────────┐
                                │  Google Sheet     │            │  MailApp.sendEmail()   │
                                │  (append 1 row)   │            │  → NOTIFY_EMAIL        │
                                └──────────────────┘            │  Reply-To: submitter    │
                                                                  └───────────────────────┘
```

Two independent systems, joined only by an HTTP POST:

- **Frontend**: a static Next.js site (`output: "export"`) — no server, no
  API routes, nothing running after build. It only knows one thing about the
  backend: a URL string in `config.ts`.
- **Backend**: a Google Apps Script project **bound to a Google Sheet**. It
  is not a general-purpose server — it lives inside one specific spreadsheet,
  runs as one specific Google account, and is published as a "Web App" that
  gives it a stable HTTPS URL.

Nothing here is MVRK-site-specific except field names and copy. The pattern
generalizes to any static site that can `fetch()` a URL.

---

## 2. Frontend half

### 2.1 The component — `src/components/ContactForm.tsx`

- **Validation**: `react-hook-form` + `zod`. Schema:
  ```ts
  const schema = z.object({
    name: z.string().min(2, "..."),
    company: z.string().min(1, "..."),
    email: z.string().email("..."),
    message: z.string().min(10, "..."),
    website: z.string().max(0).optional(), // honeypot
  });
  ```
- **Honeypot**: a `website` field, visually hidden (`aria-hidden`, `tabIndex={-1}`,
  `autoComplete="off"`), labelled "Website (leave blank)". Humans never see
  it; form-filling bots often populate every input they find. If it's
  non-empty on submit, the frontend pretends success and drops the
  submission — no error shown, so the bot doesn't learn to adapt.
- **Submit request**:
  ```ts
  fetch(config.form.endpoint, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(values),
  });
  ```
  `text/plain` is deliberate, not an oversight — Apps Script Web Apps don't
  answer CORS preflight `OPTIONS` requests, so a `Content-Type:
  application/json` header (which forces a preflight) breaks the request
  entirely. `text/plain` is a browser "simple request" and skips preflight;
  the script still reads and `JSON.parse()`s the raw body on its end.
- **Response handling is deliberately loose**: Apps Script never returns
  CORS headers on the actual response either, so even a successful `200`
  can surface to `fetch()` as an opaque network error the browser refuses to
  let JS read. The code treats **both** `res.ok` and "fetch threw" as
  "probably succeeded":
  ```ts
  const looksSuccessful = (res && res.ok) || networkError !== null;
  ```
  This trades a small number of false-positive success messages (network
  actually down) for avoiding a much more common false negative (CORS
  opacity misread as failure on a submission that actually went through).
  If you build this fresh, expect the first test to look like a failure in
  devtools even when the Sheet got the row — that's this behavior, not a bug.
- **Success/error UI**: inline panel swapped in below the form (`status`
  state), not a redirect or modal. Retry button re-calls the same submit
  closure via a ref (`submitRef`) rather than re-running validation.
- **No endpoint configured yet?** The component still works — it simulates a
  700ms delay and shows success, so the UI is reviewable before the backend
  exists. Useful during initial build; irrelevant once `config.form.endpoint`
  is set.

### 2.2 Config — `src/config.ts` → `form`

```ts
form: {
  endpoint: "https://script.google.com/macros/s/XXXXX/exec",
  fields: {
    name: "Your Name:",
    company: "Your Company:",
    email: "Your Email:",
    message: "Please Describe What You Need:",
  },
  submitLabel: "Send Request",
},
```

Single source of truth for both the endpoint URL and the field label copy
(this project's convention: nothing hardcoded in components). **The endpoint
is baked into the static bundle at `npm run build` time** — editing this
string and rebuilding does nothing to a live site until the rebuilt `out/`
folder is actually uploaded to the host. This bit anyone doing this for the
first time.

### 2.3 Why a static export matters here

`next.config.ts` has `output: "export"` and `basePath: "/zapier"`. That has
zero effect on the Apps Script side — the endpoint is an absolute external
URL, basePath doesn't touch it. It matters only for the deploy step: there is
no server to restart, just static files to re-upload after every `config.ts`
change.

---

## 3. Backend half — `apps-script/Code.gs`

### 3.1 What it is

One `.gs` file, pasted into the Apps Script editor reached via **a Google
Sheet → Extensions → Apps Script**. This is a **container-bound script** —
it lives inside that one spreadsheet, not as a standalone project. That
matters for replication: copying the *spreadsheet* (File → Make a copy)
brings the script with it; there is no separate "script file" to hand over
on its own in the normal case.

### 3.2 Configuration surface (top of file)

```js
const NOTIFY_EMAIL = "vuk@mvrk.ca";       // recipient — NOT the sender
const SHEET_NAME    = "Reach Out Submissions";
const FIELD_NAME    = "name";
const FIELD_COMPANY = "company";
const FIELD_EMAIL   = "email";
const FIELD_MESSAGE = "message";
const FIELD_WEBSITE = "website";           // honeypot key, must match frontend
```

Everything the client might reasonably want changed later (recipient) is one
constant. Everything structural (field names) is also constants, but
changing those requires matching changes in `ContactForm.tsx`'s `register()`
calls and zod schema keys — they're coupled across the two codebases by
convention, not by any shared type.

### 3.3 Entry points

- `doGet(e)` → returns `{"ok":true,"message":"... ready."}`. Exists purely as
  a browser-hittable sanity check — paste the `/exec` URL into a tab, confirm
  you see this, know the deployment is live before wiring anything up.
- `doPost(e)` → the real handler:
  1. Parse body (`_parseBody` — tries `JSON.parse`, falls back to
     `x-www-form-urlencoded` parsing for safety, though the frontend always
     sends JSON).
  2. Honeypot check — if `website` is non-empty, log it and return
     `{ok:true}` anyway (never tell a bot it failed).
  3. **Server-side validation that mirrors the frontend zod schema exactly**
     (name ≥2 chars, company ≥1, email regex, message ≥10 chars). This is
     not redundant — the frontend schema only stops a browser user; anyone
     can `curl` the `/exec` URL directly with a crafted JSON body, bypassing
     the frontend entirely. The two schemas must be kept in sync by hand;
     there's no shared validation module between a Next.js app and an Apps
     Script project.
  4. Append a row to the Sheet.
  5. Send the notification email.
  6. Return `{ok:true}` (200) or `{ok:false,error:"..."}` (400/500).

### 3.4 Sheet writing — `_appendToSheet`

- Looks up a tab literally named by `SHEET_NAME` (`ss.getSheetByName(...)`);
  falls back to whatever the active sheet is if that tab doesn't exist yet.
- Writes a bold, frozen header row on first write, if the tab is empty.
- `setup()` is a separate, manually-triggered function — **not called by
  doPost** — that does the same tab/header creation ahead of time. Its real
  job isn't the sheet: running it from the Apps Script editor UI is what
  **triggers Google's one-time OAuth consent screen**, which grants the
  script permission to touch Sheets and send Mail *as the signed-in account*.
  This is the step that actually determines whose account "owns" the script
  going forward.

### 3.5 Email — `_sendNotification` / `_buildEmailHtml` / `_buildEmailPlain`

- `MailApp.sendEmail({ to, subject, body, htmlBody, replyTo, name })`.
- **`replyTo: d.email`** — set to the *submitter's* address, not the site's.
  This is what lets the client hit "Reply" on the notification and land
  directly in a conversation with the lead, rather than replying to
  themselves.
- **`name: "MVRK Website"`** sets the display name on the From line. The
  underlying *address*, however, is not configurable at all — see §4.
- HTML email is fully inline-styled (table-based layout, inline `style=`
  everywhere) because Gmail/Outlook/Apple Mail strip `<style>` blocks. No
  external assets, no webfont — falls back to system font stack.
- A plain-text version is built and sent alongside via `body:` (the
  `htmlBody:` is what most clients render; `body:` is the fallback for
  clients that block HTML).
- All user input is HTML-escaped (`esc()`) before interpolation into the
  HTML email — this is the one place unescaped user input could otherwise
  create an HTML/attribute injection inside the email itself.

### 3.6 Response helper — `_json`

Returns `ContentService.MimeType.TEXT`, not `JSON`, deliberately — see the
comment in the file. This avoids a redirect Next.js would otherwise have to
follow, and the frontend never reads the body anyway (§2.1, status-code-only
handling).

---

## 4. The one fact that drove most of this project's form work

**`MailApp.sendEmail()` always sends from the Google account that owns the
script's active deployment. There is no "From" setting.** `NOTIFY_EMAIL`
controls the *recipient* only.

This means "whose email do notifications come from" is decided entirely by
**whoever is signed into Google when they run `setup()` and create the Web
App deployment** (§3.4, §5.2) — not by anything in the code. Get this wrong
and everything still *works* (form submits, row appears, email arrives) —
it just arrives from the wrong person, silently, and doesn't announce itself
as a mistake.

Corollary: if a script needs to send as the client, **the client must
personally do the authorize + deploy steps while signed into their own
Google account.** There is no way for a developer to do this on the client's
behalf, short of literally sharing the client's password (don't).

---

## 5. Deployment & ownership model

### 5.1 No CI/CD, no `clasp`

This repo has no `.clasp.json`, no Apps Script CLI wiring, nothing that
pushes `apps-script/Code.gs` to Google automatically. **`apps-script/Code.gs`
in this repo is a reference copy only.** The live, authoritative code is
whatever is pasted into the Apps Script editor inside the actual Google
Sheet. Every change has to be manually copied over and redeployed
(**Deploy → Manage deployments → pencil icon → Version: New version →
Deploy** — same URL, new code, no re-authorization needed for
non-permission-affecting changes like copy edits).

If the repo file and the live script drift, the repo file is decorative.
Worth a habit: after any live edit, paste the change back into the repo file
too, so the next audit doesn't lie.

### 5.2 Deployment settings that matter

| Setting | Value | Why |
|---|---|---|
| Execute as | **Me** | Makes the script run — and send mail — as whoever clicks Deploy. This is the sender-identity setting from §4. |
| Who has access | **Anyone** | The website is public; anonymous POSTs must reach it. On Workspace accounts this option is easy to mis-click as "Anyone within [domain]" instead, which 403s every external request — happened once on this project, diagnosed by `curl`ing the `/exec` URL directly and seeing a bare `403` before any app logic ran. |

### 5.3 Ownership: who owns the Sheet, and how that got resolved here

The clean model is: **the client owns the Sheet** (their lead data lives in
their Drive, not the developer's), while the developer keeps Editor access
for support. Two ways to get there:

- **Drive "Transfer ownership"** — the textbook approach, but **Google only
  allows it within the same Google Workspace domain.** On this project the
  developer's Sheet was on a personal `@gmail.com` and the client is on
  Workspace `mvrk.ca` — transfer was unavailable, a hard restriction, not a
  permissions setting anyone can override.
- **File → Make a copy** (what was actually used) — a copy is owned by
  whoever makes it, in their own Drive, and **a container-bound script comes
  along with the spreadsheet copy**. This sidesteps the domain restriction
  entirely and produces the same practical outcome. The one thing to verify
  after copying: open **Extensions → Apps Script** in the copy and confirm
  `Code.gs` is actually there — it normally survives the copy, but it's the
  single step in this whole flow that isn't 100% guaranteed, so the client
  instructions have them check explicitly rather than assume.

  Note: **deployments never copy.** The copy gets the code but has to be
  redeployed fresh under the new owner — which is exactly the step that
  fixes the sender identity, so this is a feature of the approach, not a gap
  in it.

### 5.4 The cutover sequence, as it actually happened

1. Developer built and tested everything under their own account first
   (fast iteration, no client back-and-forth for bugs).
2. Client was sent the Sheet link + `docs/client-form-setup.md`.
3. Client made their own copy, ran `setup()` (triggering their own OAuth
   consent — including the "Google hasn't verified this app" warning, which
   is normal for a private script and needs an explicit "Advanced → Go to
   ... (unsafe) → Allow" click), created their own Web App deployment, and
   sent back the resulting `/exec` URL.
4. Developer sanity-checked that URL directly (`curl` the URL — expect
   `{"ok":true,...}`). First attempt actually came back `403 Forbidden`
   because "Who has access" had landed on the Workspace-restricted option
   (§5.2) — client fixed it via **Deploy → Manage deployments → edit → Who
   has access → Anyone → Deploy**, same URL, no new link needed.
5. Once the URL checked out, developer pasted it into `config.ts` →
   `form.endpoint`, ran `npm run build`, and **re-uploaded the static `out/`
   folder to the host** — the step easy to forget, since editing `config.ts`
   and rebuilding locally has zero effect on a live static site until the
   built files are actually pushed.
6. Live form was tested end-to-end and specifically checked for **three**
   things, not one: row lands in the client's Sheet (not the developer's
   old one), email arrives at the right inbox, and — the one that actually
   matters — the email's **From** address is the client's, not the
   developer's. A test that only checks "did it work" can pass while still
   silently sending from the wrong account.
7. Developer's old test deployment gets archived only after that three-part
   check passes (**Deploy → Manage deployments → Archive** on the old
   deployment) — not before, so there's no window where the form is
   pointed at a dead endpoint.

---

## 6. Gotchas worth remembering, collected in one place

- Static export + `config.ts` change ≠ live change. Rebuild **and
  re-upload**.
- Apps Script `text/plain` trick is required to dodge CORS preflight; do not
  "fix" it to `application/json` — that breaks the request against an Apps
  Script Web App specifically.
- A `fetch()` to an Apps Script Web App can look like a network failure in
  devtools even on success, because of missing CORS headers on the response.
  Don't chase that as a bug without checking the Sheet first.
- `NOTIFY_EMAIL` ≠ sender. There is no sender config. Ever.
- Workspace accounts can default "Who has access" to an org-scoped option
  that looks identical to "Anyone" at a glance but 403s every external
  caller. Verify with a direct `curl`/browser hit on the `/exec` URL, not
  just "it deployed without error."
- Drive ownership transfer is same-domain only. Cross-domain handoff uses
  **Make a copy** instead, and deployments never carry over in a copy — that
  has to be redone by the new owner regardless.
- The repo's `Code.gs` is a reference, not the source of truth once a client
  has their own deployed copy — there is no automatic sync.

---

## 7. Replication checklist — doing this again on a different site

Use this section directly when setting the same system up for another
project (same client or not).

### 7.1 What the developer does

1. **Decide the field set** for the new form and keep names identical on
   both sides — e.g. if the new form has `name`, `email`, `phone`, `message`,
   both the zod schema (`ContactForm.tsx`) and the `FIELD_*` constants +
   validation block in `Code.gs` need those exact keys.
2. **Copy `apps-script/Code.gs` from this repo as the starting template.**
   Adjust:
   - `NOTIFY_EMAIL` → the right recipient for the new site.
   - `SHEET_NAME`, `FIELD_*` constants, and the validation block in `doPost`
     to match the new field set.
   - Sheet header row in `_appendToSheet`/`setup()` to match the new columns.
   - Email subject, HTML template copy/branding in `_buildEmailHtml` (the
     inline-style structure can stay — swap colors/copy/logo text only).
3. **Build (or adapt) the frontend form component** on the same pattern as
   `ContactForm.tsx`: zod schema mirroring the backend validation, a hidden
   honeypot field with a matching key, `text/plain` POST, and the
   opaque-response-tolerant success/failure handling from §2.1. If the new
   site isn't Next.js/static-export, the CORS and honeypot logic still
   applies unchanged — only the "endpoint baked in at build time" concern
   is specific to static export.
4. **Create a fresh Google Sheet for the new site** — do not reuse the
   existing MVRK × Zapier sheet or its script/deployment. One Sheet, one
   script, one deployment per site keeps leads from different sites out of
   each other's data and keeps sending-quota/branding cleanly separated.
5. Paste the adapted `Code.gs` in, run `setup()` under your own account,
   deploy, wire the resulting URL into the new site's config, test.
6. Write (or copy and adapt) a `docs/client-form-setup.md`-equivalent for
   this new site before handing anything to the client.
7. When ready to hand over: share the new Sheet with the client as Editor,
   send them the client-facing doc. If same-domain as the developer's
   account, ownership transfer works directly; otherwise use the
   Make-a-copy path from §5.3.

### 7.2 What to ask the client to do

Client has done this once already for the MVRK × Zapier site, so this
should go faster — but it is a **separate Sheet and a separate deployment**,
not a re-use of the existing one. Ask them to:

1. Open the link to the **new** Sheet the developer sends (not the existing
   Reach Out Submissions one).
2. Make their own copy of it (**File → Make a copy**), saved to their own
   Drive — or accept a direct ownership transfer if the developer's account
   is on the same domain this time.
3. Confirm the script came across: **Extensions → Apps Script**, should show
   a `Code.gs` with real content.
4. Run **setup** once (Apps Script editor → function dropdown → `setup` → ▶
   Run), sign into the vuk@mvrk.ca account when prompted, click through the
   "unverified app" warning (**Advanced → Go to [project] (unsafe) →
   Allow**) — they've seen this screen before.
5. **Deploy → New deployment → Web app**, with **Execute as: Me** and **Who
   has access: Anyone**, then Deploy.
6. Visit the resulting `/exec` URL in a browser, confirm it shows
   `{"ok":true,...}`.
7. Send the developer that URL, and add them as Editor on the new Sheet.

That's the complete loop — once the developer has that URL and confirms it
live, the rest (wiring it into the new site, rebuilding, re-deploying,
testing the three-part From/recipient/row check from §5.4 step 6) is on the
developer, not the client.
