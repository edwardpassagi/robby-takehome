How to run:

1. from nextjs/: npm install, then npm run dev
2. access from localhost:3000

high-level approach:

1. In "Quote", add a special section for "follow-ups", which shows the list of items that needs to be followed-up. This should follow both the follow-up policy and guardrails.
2. basic dashboard showing all events, with options to filter by quote types and channel
3.

Guardrails: 1. never message the same customer twice within a cooldown window (e.g. 14 days) 2. Never message about an accepted or dismissed quote 3. avoid double-send during a rerun / retry failed send.

Follow-up Policy:

1. Customer viewed the quote recently but nobody has responded
2. Big quote wih no contact in N days
3.

Todo later:

1. follow-up policy calculation should be done in a daily batch-job, instead of whenever the user access the "Quotes" page.

How to access:

1. clone the git repo
2. cd nextjs && npm install
3. npm run dev, then access localhost:3000
