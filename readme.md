# How to run:

1. paste your gemini API key to .env
2. from nextjs/: npm install, then npm run dev
3. access from localhost:3000
4. my Cursor conversation transcript is available in `agent-transcript.md`
5. to 'reset' the database, simply delete the `/nextjs/storage` folder

## Follow-up Policy:

1. Customer viewed the quote in the last 7 days, and nobody has responded since. This is important in case the follow-up got buried under other messages.
2. Big quote (over $3,000) with no contact for 3 days. This is important since these are transactions that brings the biggest revenue. Customers can decide whether they want to follow-up on smaller amount, but at a certain point (if a quote is very small), it might not be worth the effort to follow-up at all.
3. This quote was already followed up previously more than 5 days ago, and it has been followed up fewer than 3 times. Multiple follow-ups may sometimes be warranted, especially for larger transactions. We shouldn't rule out a follow-up simply because they had ben previously followed-up before, but we also need to not overdo it.
4. If none of these are true, then we don't show the follow-up button altogether. This is to prevent technicians accidentally sending a follow-up when they shouldn't have.

## What changes when this runs for a parent company with 50 shops, each with their own quotes, phone numbers, and opinions about what "follow up" means?

When this runs for a parent company, we can simply add another property for the store identifier (e.g. `store_id`) for each relevant tables (quotes, events, etc.) which can then be used to identify what needs to be shown on the dashboard. The user can select which store they want to see, or have the options to see all the data from every store.

Follow-up can be modified so that it's no longer hard-coded, but rather be stored in the database as a user-defined logic. We can create an interface that allows the user to modify VIEW_WINDOW, QUIET_WINDOW, REPEAT_GAP, MAX_FOLLOW_UPS, LARGE_QUOTE_AMOUNT, etc. If they need more granularity, we can develop a suite for the follow-up engine that allows the user to create custom rules (if-else logic).

## What I'd build next with another day:

1. Crate a batch job that runs daily during downtime (e.g. 1AM) to reduce loading time. This can be used to:
   1. Calculate the quotes that needs to be followed-up
   2. Generate follow-up drafts for each of these quotes
      This is especially important as the list of quotes grows larger.
2. Optimize the view for smaller screens (e.g. iPad)
3. Allow customization for the AI-drafted response
4. Allow support for parent company viewing multiple stores
