// Follow-up candidates for the quotes page.
// A quote can match more than one rule. Closed quotes are not candidates.
//
// 1. Customer viewed the quote in the last 7 days, and nobody has responded since.
// 2. Big quote (over $3,000) with no contact for 3 days.
// 3. This quote was already followed up, the last follow-up was more than 5 days ago,
//    and it has been followed up fewer than 3 times.

const DAY_MS = 24 * 60 * 60 * 1000;
const VIEW_WINDOW_MS = 7 * DAY_MS;
const QUIET_WINDOW_MS = 3 * DAY_MS;
const REPEAT_GAP_MS = 5 * DAY_MS;
const MAX_FOLLOW_UPS = 3;
const LARGE_QUOTE_AMOUNT = 3000;

export type PolicyQuote = {
  id: string;
  customer_name: string;
  customer_phone: string;
  tech_name: string;
  amount: number;
  status: "open" | "accepted" | "dismissed";
  created_at: string;
  last_contact_at: string | null;
};

export type PolicyEvent = {
  event_id: string;
  type: string;
  quote_id: string;
  timestamp: string;
};

export type FollowUpReason = {
  code: "viewed_no_response" | "large_quote_quiet" | "repeat_follow_up";
  text: string;
};

export type FollowUpCandidate<T extends PolicyQuote = PolicyQuote> = {
  quote: T;
  reasons: FollowUpReason[];
};

type StoredEvent = PolicyEvent & { at: number };

export function referenceNow(events: PolicyEvent[]): Date {
  let latest: number | null = null;
  for (const event of events) {
    const at = Date.parse(event.timestamp);
    if (Number.isFinite(at) && (latest === null || at > latest)) latest = at;
  }
  return latest === null ? new Date() : new Date(latest);
}

export function selectFollowUps<T extends PolicyQuote>(
  quotes: T[],
  events: PolicyEvent[],
  now: Date,
): FollowUpCandidate<T>[] {
  const nowMs = now.getTime();
  const byQuote = groupEvents(events);
  const candidates: FollowUpCandidate<T>[] = [];

  for (const quote of quotes) {
    if (quote.status !== "open") continue;
    const quoteEvents = byQuote.get(quote.id) ?? [];
    const reasons: FollowUpReason[] = [];

    const viewed = viewedWithoutResponse(quoteEvents, nowMs);
    if (viewed) reasons.push(viewed);

    const quiet = largeQuoteGoneQuiet(quote, quoteEvents, nowMs);
    if (quiet) reasons.push(quiet);

    const repeat = dueForAnotherFollowUp(quoteEvents, nowMs);
    if (repeat) reasons.push(repeat);

    if (reasons.length > 0) candidates.push({ quote, reasons });
  }

  candidates.sort((a, b) => {
    const score = scoreReasons(b.reasons) - scoreReasons(a.reasons);
    if (score !== 0) return score;
    if (b.quote.amount !== a.quote.amount)
      return b.quote.amount - a.quote.amount;
    return a.quote.id.localeCompare(b.quote.id);
  });

  return candidates;
}

function viewedWithoutResponse(
  events: StoredEvent[],
  nowMs: number,
): FollowUpReason | null {
  const latestView = latestOfType(events, "quote_viewed");
  if (latestView === null || nowMs - latestView > VIEW_WINDOW_MS) return null;

  const responded = events.some(
    (event) =>
      (event.type === "customer_replied" || event.type === "message_sent") &&
      event.at >= latestView,
  );
  if (responded) return null;

  return {
    code: "viewed_no_response",
    text: "Viewed in the last 7 days, and nobody has responded since.",
  };
}

function largeQuoteGoneQuiet(
  quote: PolicyQuote,
  events: StoredEvent[],
  nowMs: number,
): FollowUpReason | null {
  if (quote.amount <= LARGE_QUOTE_AMOUNT) return null;

  const lastContact = latestContact(quote, events);
  const anchor = lastContact ?? Date.parse(quote.created_at);
  if (!Number.isFinite(anchor) || nowMs - anchor < QUIET_WINDOW_MS) return null;

  return {
    code: "large_quote_quiet",
    text: "Over $3,000 with no contact for 3 days.",
  };
}

function dueForAnotherFollowUp(
  events: StoredEvent[],
  nowMs: number,
): FollowUpReason | null {
  const followUps = events.filter((event) => event.type === "message_sent");
  if (followUps.length === 0 || followUps.length >= MAX_FOLLOW_UPS) return null;

  const lastFollowUp = Math.max(...followUps.map((event) => event.at));
  if (nowMs - lastFollowUp <= REPEAT_GAP_MS) return null;

  return {
    code: "repeat_follow_up",
    text: `Last follow-up was more than 5 days ago (${followUps.length} of 3).`,
  };
}

function latestContact(
  quote: PolicyQuote,
  events: StoredEvent[],
): number | null {
  const times = events
    .filter(
      (event) =>
        event.type === "message_sent" || event.type === "customer_replied",
    )
    .map((event) => event.at);
  if (quote.last_contact_at) {
    const at = Date.parse(quote.last_contact_at);
    if (Number.isFinite(at)) times.push(at);
  }
  if (times.length === 0) return null;
  return Math.max(...times);
}

function latestOfType(events: StoredEvent[], type: string): number | null {
  const matches = events.filter((event) => event.type === type);
  if (matches.length === 0) return null;
  return Math.max(...matches.map((event) => event.at));
}

function scoreReasons(reasons: FollowUpReason[]): number {
  const weight = {
    viewed_no_response: 4,
    repeat_follow_up: 2,
    large_quote_quiet: 1,
  };
  return reasons.reduce((total, reason) => total + weight[reason.code], 0);
}

function groupEvents(events: PolicyEvent[]): Map<string, StoredEvent[]> {
  const seen = new Set<string>();
  const grouped = new Map<string, StoredEvent[]>();

  for (const event of events) {
    if (seen.has(event.event_id)) continue;
    seen.add(event.event_id);
    const at = Date.parse(event.timestamp);
    if (!Number.isFinite(at)) continue;
    const list = grouped.get(event.quote_id) ?? [];
    list.push({ ...event, at });
    grouped.set(event.quote_id, list);
  }

  return grouped;
}
