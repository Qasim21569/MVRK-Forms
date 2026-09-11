# MVRK Forms waitlist — setup steps for Vuk

This is the same setup you did for the MVRK × Zapier "Reach Out" form, so most
of it will look familiar. It should take about ten minutes.

**It is a brand-new Sheet and a brand-new deployment.** It is not a reuse of
the Reach Out one. Keeping them separate keeps waitlist signups out of the
Reach Out data, and keeps the two sites from sharing a sending quota.

The end result: when somebody joins the waitlist on the MVRK Forms site, a row
lands in your spreadsheet and you get an email about it — **from you, to you**,
with the signup's address on Reply-To so you can just hit Reply.

---

## What you'll need

- To be signed into Google as **vuk@mvrk.ca** (not a personal account — this is
  what decides which address the notification emails come from).
- The link to the new Sheet, which I'll send you.
- About ten minutes, in one sitting. Don't stop halfway between steps 4 and 5.

---

## Step 1 — Open the Sheet I send you

I'll send a link to a Sheet called something like **MVRK Forms — Waitlist**.

Check it's that one and not "Reach Out Submissions" from the other site.

## Step 2 — Make your own copy

**File → Make a copy.** Save it to your own Drive. Name it whatever you like.

This matters: the copy is owned by *you*, in *your* Drive, so the signup data
lives in your account rather than mine. (Google only allows a direct ownership
transfer between accounts on the same domain, and mine isn't on mvrk.ca — so a
copy is the way round it. Same end result.)

**From here on, work in your copy.** Close my original so you don't mix them up.

## Step 3 — Check the script came across

In your copy: **Extensions → Apps Script.**

A file called `Code.gs` should open with a few hundred lines in it. If it's
there, you're fine — close the check and move on.

If it's empty or missing, stop and tell me. This is the one step in the whole
process that isn't guaranteed, which is why it's worth thirty seconds to look.

## Step 4 — Run `setup` once

Still in the Apps Script editor:

1. In the function dropdown at the top, choose **`setup`**.
2. Click **▶ Run**.
3. Google will ask you to sign in and approve permissions — **sign in as
   vuk@mvrk.ca**.
4. You'll get **"Google hasn't verified this app"**. That's expected for a
   private script like this one — it just means it was never submitted to
   Google for public review, which it shouldn't be. Click **Advanced → Go to
   [project name] (unsafe) → Allow**.

This is the step that matters most. Approving it as vuk@mvrk.ca is what makes
the notification emails come **from you**. If it gets approved under a
different account, everything still appears to work — the row lands, the email
arrives — it just quietly comes from the wrong person.

When it finishes, a new tab called **Waitlist Signups** appears in the Sheet
with a header row.

## Step 5 — Deploy it as a Web App

**Deploy → New deployment.**

1. Click the gear next to "Select type" and pick **Web app**.
2. Description: anything, e.g. "MVRK Forms waitlist".
3. **Execute as: Me (vuk@mvrk.ca)**
4. **Who has access: Anyone**
5. **Deploy.**

⚠️ **Step 4 is the one that goes wrong.** On a Workspace account there is an
option that reads almost identically — "Anyone within MVRK" or similar. It is
*not* the same, and it blocks every visitor on the public website. It has to be
plain **Anyone**. This caught us out on the last site.

## Step 6 — Check the URL works

Deploying gives you a **Web app URL** ending in `/exec`. Copy it.

Paste it into a normal browser tab. You should see:

```
{"ok":true,"message":"MVRK Forms waitlist endpoint is ready."}
```

If you see that, it's live. If you get a **403** or a Google sign-in page
instead, it's the "Who has access" setting from step 5 — fix it with
**Deploy → Manage deployments → pencil icon → Who has access → Anyone →
Deploy**. The URL stays the same, so you don't need to resend anything.

## Step 7 — Send me two things

1. **The `/exec` URL.**
2. **Editor access on the Sheet** — Share → add my address as Editor, so I can
   help if anything breaks later.

---

## Then I take over

Once I have that URL I wire it into the site, rebuild, redeploy, and run a real
submission through it. I'll be checking three things, not one:

- the row lands in **your** Sheet
- the email arrives at **vuk@mvrk.ca**
- the email's **From** is **you**, not me

That third one is the whole reason you do steps 4 and 5 yourself rather than me
doing them.

---

## Afterwards

**Where do signups go?** The **Waitlist Signups** tab: timestamp, first name,
last name, email, consent, and which form it came from.

**Want the notifications to go somewhere else?** One line in the script —
tell me the address and I'll send you the change, or open
**Extensions → Apps Script** and edit `NOTIFY_EMAIL` at the top yourself, then
**Deploy → Manage deployments → pencil → Version: New version → Deploy**.

**Someone signs up twice?** The second one is ignored on purpose — no duplicate
row, no duplicate email.

**Nothing arriving?** Check the Sheet first. If rows are landing but emails
aren't, it's the email half; if neither is happening, it's the deployment.
Either way, send me the `/exec` URL and I'll check it from my side.
