# Robby takehome assessment
_Exported on 10/22/2026 at 14:16:57 CDT from Cursor (3.24.18)_

---

**User**

this is a takehome assessment for a startup in the home service industry, Robby. the deliverables is listed under Robby Takehome Assignment_Final.pdf. I'd like you to go through the document as well as the current directory to get more context about the purpose behind this conversation.

---

**Cursor**

I'll read the assignment and look through the project so I understand what this takehome is asking for.

This conversation is for Robby's follow-up engine take-home. The repo is still empty except for the assignment, a stub README, and the seed data.

Robby helps home-service techs and shop owners chase open quotes before a homeowner buys from someone else. Quotes sit open for days. Homeowners view them, sometimes reply, sometimes disappear. Follow-up today is a person scrolling a list each morning and texting whoever they remember. The MVP should decide who to contact, when, draft the message, and send only after a person approves.

**What to build**

1. Ingest the event stream into storage you choose. The stream is messy on purpose: duplicates and out-of-order timestamps.
2. A follow-up policy that, for a given "now," returns a prioritized list of candidates, each with a reason (viewed recently with no response, large quote with no contact in N days, plus any other signals you choose).
3. Message drafting.
4. A draft, then approve, then send flow. Sending can be an outbox (table, file, or log), designed as if a real SMS or email provider sits behind it.
5. A way to run it locally. UI, auth, deployment, and framework choice are not what they grade.

**Guardrails they care about**

- Never message the same customer twice inside a cooldown window.
- Never message about an accepted or dismissed quote.
- Re-running the engine, or retrying a failed send, must never double-send.

**What they grade**

Correctness on messy input, those safety guardrails, how quote and message state is modeled, and the judgment in the README. Time box is 3 hours. They want a smaller thing done carefully, and they want the README to say where you stopped. AI is allowed, but the conversation history has to be submitted, and you have to be able to defend every choice.

**The repo right now**

`readme.md` is a sketch: Next.js (`npm install`, `npm run dev`), a dashboard of events with filters by quote type and channel, and two blank steps. There is no app code yet.

`seed/quotes.json` has 30 quotes. Fields are `id`, `customer_name`, `customer_phone`, `tech_name`, `amount`, `status` (`open` | `accepted` | `dismissed`), `created_at`, `last_contact_at`. Twenty-seven are open, two accepted (`Q-1004`, `Q-1017`), one dismissed (`Q-1009`). Amounts run from $420 to $22,000. Ten have never been contacted. Five techs: Brad, Jaden, Jose M., Ridge, Zach. Created dates fall between 2026-08-01 and 2026-08-11.

`seed/events.jsonl` has 88 lines and 82 unique `event_id`s (6 duplicates). Types in the file: `quote_viewed` (38), `quote_sent` (32), `customer_replied` (11), `message_sent` (6), `quote_accepted` (1). The PDF only names viewed, replied, message sent, and accepted. `quote_sent` is extra and real. Replies and outbound messages carry `channel` (`sms` or `email`); outbound messages also have `direction: outbound`. Every event's `quote_id` matches a quote, and every quote has at least one event. Timestamps are not sorted.

The README they want at the end covers how to run it, the follow-up policy and why, about two paragraphs on what changes for a parent company with 50 shops (each with its own quotes, phone numbers, and idea of what "follow up" means), and what you would build with another day. Tests only where the risk is real.

---

**User**

great. i'd like you to create a simple, app-router next.js app (tailwindcss, typescript) in /app. show a simple, clean UI that matches the existing Robby UI shown in the screenshot. For now, the dashboard components should show a a page for events and quotes. Quotes should show all items in quotes.json, while Events should show all the items in events.jsonl, sorted descending by timestamp. Add a simple filter / sorting mechanism to allow the user to better navigate these pages.

For the sake of time + brevity, storage should all be handled locally. You can store items in the respective .json files, stored under /storage folder on the root directory.

---

**Cursor**

I'll match the Robby dashboard in the screenshot and set up a small Next.js app that reads quotes and events from local JSON under `/storage`.

---

**User**

the seed folder is used to initialize the relevant storage files in /storage. /storage folder itself will be in .gitignore, and a user can simulate resetting the database by simply removing the /storage folder

use motion.dev to render animations for the UI for a smoother / more sleek experience where appropriate.

---

**Cursor**

The app will seed `/storage` from `seed/` on first read, ignore that folder in git, and recreate it if you delete it. I'll match the Phoenix Services layout and use Motion for the page transitions and list updates.

The event list was counting repeats in a confusing way, and the quote columns were cramped. I'll clean those up, then install and run the app.

---

**User**

<timestamp>Thursday, Oct 22, 2026, 12:05 PM (UTC-5)</timestamp>
<system_notification>
The following task has finished. If you were already aware, ignore this notification and do not restate prior responses.

<task>
kind: shell
status: success
task_id: 40384
title: Start Next.js dev server
tool_call_id: call-ac111a6a-a6de-4f80-8f42-b6e467e4f8b1-59
fc_796e3848-4239-9e13-bfe0-f0d67c6674ae_0
output_path: /Users/epassagi/.cursor/projects/Users-epassagi-Coding-interviews-robby-takehome/terminals/40384.txt
</task>
</system_notification>
<user_query>Briefly inform the user about the task result and perform any follow-up actions (if needed). If there's no follow-ups needed, don't explicitly say that.</user_query>

---

**Cursor**

The first dev server died in the sandbox. The app is running on a second server, and I’m finishing the checks I still had open.

The events page is throwing a hydration warning. Date formatting differs between the server and the browser, so I’m switching those labels to a fixed UTC format and checking the page again.

The dashboard is in place. Run `npm run dev` and open [http://localhost:3000/quotes](http://localhost:3000/quotes).

It is a Next.js app with the App Router, TypeScript, and Tailwind. The layout follows the Phoenix Services screen: white sidebar, summary cards, and an airy list. **Quotes** and **Events** are the two pages. Motion handles the page transition, the card entrance, the open-quote bar, and list updates when you filter.

**Quotes** reads all 30 quotes. You can search by name, phone, tech, or quote id, filter by status and tech, and sort from the column headers. **Events** shows all 88 stream rows, newest first, grouped by day. Duplicate deliveries stay in the list and are marked Repeat. You can filter by type and channel.

`storage/` is the local database and is gitignored. The first read copies `seed/quotes.json` and turns `seed/events.jsonl` into `storage/events.json`, including the duplicate lines. Delete the `storage` folder and the next request rebuilds it from the seed.

---

**User**

<timestamp>Thursday, Oct 22, 2026, 12:07 PM (UTC-5)</timestamp>
<system_notification>
The following task has finished. If you were already aware, ignore this notification and do not restate prior responses.

<task>
kind: shell
status: aborted
task_id: 40385
title: Start Next.js dev server outside sandbox
tool_call_id: call-c001edc0-3a77-4364-a5e1-88870cd16932-62
fc_14f5b267-40ae-9f2d-9932-20916a5a17c4_0
output_path: /Users/epassagi/.cursor/projects/Users-epassagi-Coding-interviews-robby-takehome/terminals/40385.txt
</task>
</system_notification>
<user_query>Briefly inform the user about the task result and perform any follow-up actions (if needed). If there's no follow-ups needed, don't explicitly say that.</user_query>

---

**Cursor**

The dev server has stopped. Start it again with `npm run dev`, then open [http://localhost:3000/quotes](http://localhost:3000/quotes).

---

**User**

move all the nextjs project files under /nextjs in the root directory

---

**Cursor**

The Next.js app will live in `/nextjs`. Seed data and `storage/` stay at the repo root, so I’ll point the app at those paths after the move.

The Next.js app now lives in `nextjs/`. `seed/`, `storage/`, and the README stay at the repo root.

Run it from that folder:

```bash
cd nextjs
npm install
npm run dev
```

The app still reads and writes `storage/` at the repo root. Deleting that folder still resets the data from `seed/`.

---

**User**

@nextjs/lib/storage.ts:8 i see that /storage is still in repo root. move it inside /nextjs as well since it is only used for the storage for the nextjs app.

---

**Cursor**

`storage/` is only used by the Next app, so I’ll move it under `nextjs/` and point the reader at that folder. Seed data stays at the repo root.

`storage/` now lives at `nextjs/storage/`. The app reads and writes that folder when you run it from `nextjs/`, and it still seeds missing files from the repo-root `seed/` directory. Deleting `nextjs/storage` resets the data. The folder stays gitignored.

---

**User**

page.tsx (7) i see that readEvents is directly importing from storage.ts. This is not standard practice in the industry. Make read/write operations be done in server actions instead, so that it's easy to integrate with cloud storage providers if we expand on it later on.

---

**Cursor**

Pages are reading the filesystem directly. I’ll put those reads and writes behind server actions so the storage implementation can be swapped later.

Pages will call server actions for every read and write. The filesystem code stays behind that boundary so a cloud store can replace it later.

Pages no longer touch the filesystem. Quotes, events, and the layout date all go through server actions in `nextjs/app/actions/storage.ts`.

`readQuotes`, `readEvents`, `writeQuotes`, `writeEvents`, and `latestEventTimestamp` are the public API. They call `getQuoteStore()`, which today returns the local JSON files in `nextjs/storage`. A cloud provider would implement the same `QuoteStore` interface and be returned from `getQuoteStore()` without changing the pages.

---

**User**

that's not what I meant. events and quotes should have their own respective `action.ts` that contains read/write operations to those "tables".

---

**Cursor**

Quotes and events should each own their reads and writes. I’ll split the shared storage actions into `quotes/action.ts` and `events/action.ts`.

Quotes and events now each have their own server actions.

- `nextjs/app/quotes/action.ts` has `readQuotes` and `writeQuotes`.
- `nextjs/app/events/action.ts` has `readEvents`, `writeEvents`, and `latestEventTimestamp`.

The events page still calls `readQuotes` so it can show the customer on each event. That read goes through the quotes action, not the events file. The shared `app/actions/storage.ts` file is gone.

---

**User**

implement the high-level design i've added in @follow-up-policy.ts (1-7)  and @guardrails.ts (1-8). guardrails.ts will eventually be used when the user tries to "send" a message (currently not implemented). Create a new section in @nextjs/app/quotes/page.tsx:6-9 to show the list of "We think we should follow-up on these...". This section should show a loading state if it's still calculating the list of quotes to be shown

---

**Cursor**

The follow-up list should come from the policy you sketched, with the guardrails ready for send later. I’ll read the quote data and the quotes page so the new section fits the dashboard.

The follow-up list will use the three rules in the policy file, and the guardrails will be ready for send without a send button yet. The quotes page will show that list on its own, with a loading state while the calculation runs.

The quotes page now leads with **We think we should follow-up on these**. That block shows a loading state while `readFollowUps` runs, then the ranked list. The rest of the quote book renders underneath it.

A quote is included when it is still open and any of these are true, measured from the latest event in the stream (Aug 16, 2026, the same date in the header):

- The customer viewed it in the last 7 days, and there has been no reply and no outbound message since that view.
- The amount is over $3,000, and there has been no contact for 3 days. Contact is `last_contact_at`, an outbound message, or a customer reply. If nobody has ever been in touch, the 3 days start at `created_at`.
- This quote already has 1 or 2 follow-ups (`message_sent`, duplicate deliveries counted once), and the last one was more than 5 days ago.

Quotes that match more than one rule are listed once, with every reason, and a recent unanswered view ranks above a quiet large quote. On the seed data that is 20 quotes. Carl Dawson is first.

`canSendFollowUp` in `guardrails.ts` is the send check, exposed as `checkFollowUpGuardrails` on the quotes action. Nothing calls it yet, because there is no send button. It blocks an accepted or dismissed quote, a second send to the same phone within 1 minute, and any follow-up to that customer within 7 days.

The list uses the 5-day gap from the policy. The send check uses the 7-day cooldown, so a quote can appear here and still be blocked at send time until day 7.

`cd nextjs && npm test` covers both files.

---

**User**

the follow-up section ended up taking too much vertical space before the user can see the quotes summary. Instead, make it be a collapsible warning section (with a yellow background) that only shows the first 2 quotes, and the rest only shows if its uncollapsed. Also, for each follow-up quotes, add a "Follow-up <fa-arrow-right>" button right next to it.

Also, add yellow borders to the quotes list for quotes @nextjs/components/quotes-dashboard.tsx:200-208 for quote that we have determined needs a follow-up. add a follow-up button to it as well.

---

**Cursor**

The follow-up block should sit as a short yellow warning, and quotes that need a follow-up should be marked in the main list. I’ll look at both sections and wire that through.

The warning will stay collapsed to the first two quotes, and any quote that needs a follow-up will get a yellow border and a Follow-up button in the main list.

The follow-up button on each quote row is getting cut off at the right edge. I’ll move it next to the customer name so it stays on screen.

The follow-up block is now a yellow warning above the summary. It stays collapsed to the first two quotes, with **Show 18 more** for the rest.

Each of those quotes has a **Follow-up →** button. The same button sits beside the customer name in the quote list, and those rows have a yellow border. Walt Herrera and Stan Pruitt, who are not on the list, stay plain. Clicking **Follow-up** scrolls that quote into view. Sending a message is still not wired up.

---

**User**

@nextjs/lib/quotes/guardrails.ts:8 i also added a new guardrail to prevent double-sending due to concurrency. add this to the logic + add a testcase for it.

---

**Cursor**

The new rule is about two people sending to the same customer at once. I’ll read the guardrail and its tests so the lock matches how sends are checked today.

The other checks only look at messages that already went out. This one needs an in-progress send from a different person, so I’ll block that in the guardrail and cover it with a test.

`canSendFollowUp` now blocks a send when another user already has an in-progress follow-up for that customer's phone. The check runs before the "already sent" rules, because this message has not landed yet.

The same person's own in-progress attempt is allowed through, and a pending send for a different phone does not block this customer. The new test covers all three cases.

---

**User**

@nextjs/app/quotes/action.ts:35 pending followups array is not being passed here. i dont think this approach would work since this would only be enforced on a client level. A better approach here would be to isolate the send attempt into its own function accessed by multiple clients at once that requires a LOCK (and a failed lock for this send attempt means that it is concurrently being accessed by another client)

---

**Cursor**

A client-supplied pending list cannot see another browser. The send attempt will take an exclusive lock on the server, and a failed lock means another client is already in that send.

`attemptFollowUpSend` is now the only send entry point, and it takes an exclusive lock for that customer's phone before it checks the other guardrails. The lock is a file created under `nextjs/storage/locks`. Creating it is atomic, so a second client that arrives while the first still holds it fails the lock and gets "Another user is already sending a follow-up to this customer."

The other checks, including the one-minute retry and the 7-day cooldown, run only after the lock is held, and the lock is released when the attempt finishes. A lock older than a minute is treated as abandoned, so a crashed request does not block that customer forever. Two different customers can still send at the same time.

`checkFollowUpGuardrails` calls this function, so there is no unlocked path. The test holds one lock and confirms a second attempt for the same phone fails, a different phone succeeds, and the phone can be locked again after release.

---

**User**

great. now we will implement generative AI to create a draft SMS to be sent to the customer via SMS. This draft should take the follow-up reason into account, but it shouldn't expose the inner business workings behind why they're being followed-up on (e.g. don't say we're following up since the quote is larger than $3,000, or things of that nature). Keep it simple but still targeted (it's been a while since we've heard from you (if it's relevant), etc.)

Refer to this file here @nextjs/lib/genai/follow-up-draft.ts:1-3 and refer to the Gemini API documentation for instructions on how to integrate it to the app: https://ai.google.dev/gemini-api/docs#javascript 

When the user clicks follow-up, it should feed the relevant information to the model, and the UI shows a popup modal with the Contact name (and phone number), as well as the body of the content. While the AI is till loading, the UI should show a loading state that clearly shows that we're currently generating the draft for the message (Generating message draft, along with a loading state). Also use fa-wand-magic-sparkles to clearly indicate that an AI is used to generate the message.

Once it's done, the user can modify the body. A send button should show at the bottom right of the modal. Once the user clicks it, it runs the guardrails check @nextjs/lib/quotes/guardrails.ts:34, and send only if it returns ok:true. Otherwise, show the error to the user directly on the popup.

If a send is successful, we don't need to actually send a text message. Instead, store the follow-up contact + message in a new table called follow-ups (in this case, /storage/follow-ups.json). The dashboard should have a new column for Follow-ups, which shows the list of follow-ups that we have sent.

---

**Cursor**

The draft should be a short SMS that uses the follow-up reason without spelling out the internal rules. I’ll check the Gemini setup and the send path so the modal, guardrails, and `follow-ups` table stay on one flow.

The send action was matching the customer by name, which breaks when one person has two quotes. I’ll keep the quote id on the draft so the right quote is stored.

Clicking **Follow-up** opens a draft modal for that customer. While Gemini 3.8 Flash writes the SMS, the modal shows **Generating message draft** with a sparkles wand. When the draft arrives, the name, phone number, and message are shown, and the message can be edited. **Send** sits at the bottom right.

Send does not text anyone. It takes the customer lock, runs `canSendFollowUp`, and only then appends the message to `nextjs/storage/follow-ups.json`. If a guardrail fails, including another client already holding the lock, the reason stays on the modal. Sent messages also count as contact, so a second send to that person is blocked by the one-minute and seven-day rules. The quotes table has a **Follow-ups** column listing what was sent for each quote.

The draft prompt uses the follow-up reason only to set the tone. It tells the model not to mention cutoffs, quote size, scores, or how many times someone has been contacted.

I opened a draft for Carl Dawson and the loading state appeared. Gemini then rejected the key in `nextjs/.env.local`, so the modal showed that error and no message was stored. A valid `GEMINI_API_KEY` is what that call needs.

---

**User**

The dashboard should have a new column for Follow-ups, which shows the list of follow-ups that we have sent.

---

**Cursor**

The quotes table should list sent follow-ups in their own column. I’ll check how that column is rendered against what’s stored.

The Follow-ups column is on the quotes table, but it sits at the right edge, so the sent messages are easy to miss. I’ll move that column into view and add a Follow-ups page that lists every message that was sent.

Sent follow-ups now show up in two places.

The sidebar has a **Follow-ups** page that lists every message stored in `follow-ups.json`, newest first, with the customer, phone, quote, time, and the full text. Karen Nguyen’s “custom text” from Aug 16 is the one currently there.

On the quotes table, the **Follow-ups** column sits next to the customer. A quote with nothing sent shows a dash. A quote that was sent shows the time and the message.

---

**User**

dont forget to record the follow-up sent to the events, and update the last_contacted_at in quotes after a a successful follow-up was sent

---

**Cursor**

A successful send should land in the event stream and update that quote’s last contact time. I’ll wire both into the send path that already holds the lock.

The send already stores the message. I’ll also append a `message_sent` event and set `last_contact_at` on the quote before the lock is released.

A successful send now writes three records before the lock is released.

- The message is still saved in `follow-ups.json`.
- A `message_sent` SMS event is appended to `events.json`, using the same id as the follow-up so it is not counted twice.
- The quote's `last_contact_at` is set to that send time. That is the field already on each quote.

The quotes list reloads after send, so Last contact updates without a refresh. Follow-ups already in `follow-ups.json` were copied into the event stream, and those quotes' last contact times were set as well. Karen Nguyen's quote `Q-1025` now shows Aug 16, 4:00 PM.

---

**User**

use current date. don't use august 16 (or other arbitrary dates). Also, make sure that the date filter here @nextjs/components/top-bar.tsx:18-19 works as expected

---

**Cursor**

The header date is still the latest event in the seed, August 16, and it doesn’t filter anything. I’ll switch the app to today’s date and make that control actually limit what each page shows.

The header date is a real date control, and it defaults to today, October 22, 2026. August 16 is no longer the clock for the app.

Changing the date filters each page:

- **Events** shows only events from that day.
- **Follow-ups** shows only messages sent that day.
- On **Quotes**, the follow-up warning and the Follow-ups column use that same day. The quote book itself stays the quotes that already existed by then.

Follow-up timing is measured from the selected date. If that date is today, it uses the current time. A send is still recorded at the real current time, so the one-minute and seven-day checks stay tied to when the message actually went out. The chosen date stays in the address bar when you move between Quotes, Follow-ups, and Events.

---

**User**

localhost:3000/events currently doesnt show anything

---

**Cursor**

The events page is empty because the date control only keeps records from today, and the seed events are all from August. I’ll change it so the selected date means “as of this day,” and today shows the full history.

Events are hidden because the header date only keeps records from that exact day, and today has none of the August stream. The control will mean “as of this date,” so today shows the full history and an earlier date cuts off anything after it.

The events page was empty because the date control kept only records from that exact day, and today has none of the August stream. It now means **as of this date**. With today selected, all 88 events are listed. Choosing an earlier date hides anything that happened after it. The follow-ups list and the Follow-ups column on each quote use the same cutoff.

---

**User**

i see. update the @nextjs/components/top-bar.tsx:36-41 so that it shows all dates by default, and only filter if the user explicitly chose a date. Also, make the error message clearer (no events / quotes / etc. for the selected date, and a button to reset the date filter) 

---

**Cursor**

The date control should start unfiltered and only narrow the lists after someone picks a day. I’ll look at how that value is stored and where the empty states are rendered.

The date control currently treats today as a filter, so an empty day looks like there is no data. I’ll make “all dates” the default and only narrow the lists after a date is chosen, with a clear empty state and a way to reset.

---

**User**

update interactive elements to show cursor-pointer when appropriate.

---

**Cursor**

Interactive controls should use a pointer cursor. I’ll check which buttons and clickable controls are missing it.

Buttons and selects keep the default arrow because the stylesheet never sets a pointer. I’ll give clickable controls a pointer, and disabled ones a not-allowed cursor.

Links, buttons, selects, and the date control now show a pointer cursor. Text fields still use the text cursor, and a disabled control shows a not-allowed cursor.

---

**User**

All dates currently doesnt allow the user to select a date

---

**Cursor**

The “All dates” control is blocking the date picker. I’ll look at how that input is layered and fix it so a date can still be chosen.

The “All dates” label sits on top of a date field that only opens when the tiny calendar icon is clicked. I’ll make the whole control open the picker.

The “All dates” label is covering a transparent date field, and that field only opens from its calendar icon. I’ll turn the label into a control that opens the picker.

The calendar only opened from a hidden icon, so a click on “All dates” did nothing. I’ll make the whole control open the date picker.

The browser’s built-in date field only opens from a tiny icon, so clicking “All dates” never shows a calendar. I’ll replace it with a calendar that opens from that control.

---

**User**

since all dates is only relevant for follow-ups and events dashboard, move it so that it only shows there, not on the layout.tsx level

---

**Cursor**

The date control lives in the shared header, so it shows on every page. I’ll move it onto the follow-ups and events dashboards only.

The date control is in the shared header, so it appears on every page. I’ll take it out of the layout and put it on the follow-ups and events dashboards.

The date control now lives only on the Follow-ups and Events dashboards. Quotes no longer shows it, and a date chosen on those two pages does not filter the quotes list.

---

**User**

the date filter for the events page needs to be updated so it only shows events in that exact date (similar to how it works in follow-ups)

---

**Cursor**

The events date filter still includes everything up to the selected day. I’ll check how follow-ups narrows to one day and match that.

Events currently include everything on or before the chosen day. I’ll limit that list to the selected calendar day.

Choosing a date on Events now keeps only events from that calendar day. August 16 shows the one view from that day, and August 10 shows the 13 events from that day. Follow-ups uses the same exact-day match.

---

**User**

help me draft a commit header and message for the staged changes. Use the 50/72 rule.

---

**Cursor**

I’ll look at what’s staged and match the repo’s commit style so the subject stays within 50 characters and the body wraps at 72.

`nextjs/.env` is staged and contains `GEMINI_API_KEY`. Unstage it before you commit. `.gitignore` only ignores `.env.local`, so this file would be committed as-is.

```
Add follow-up drafting, guardrails, and send flow

Select quotes that need a follow-up, draft an SMS with Gemini,
and record a send only after the guardrails and per-customer
lock pass. Events and follow-ups can be filtered to a single day.
```

The subject is 49 characters. Each body line is under 72.

