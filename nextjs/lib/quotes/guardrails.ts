// Send-time checks. A follow-up may be drafted before these pass.
// Returns ok only when the message is safe to send.
//
// 1. Do not double-send on a rerun or a retry of a failed send
//    (a follow-up already went out in the last minute).
// 2. Do not message a customer who received a follow-up in the last 7 days.
// 3. Do not message an accepted or dismissed quote.
// 4. Prevent double-sending due to concurrency. This is not checked from a
//    client-supplied list. attemptFollowUpSend holds an exclusive lock per
//    customer phone; a failed lock means another client is already in that send.

const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const COOLDOWN_MS = 7 * DAY_MS;

export type GuardrailQuote = {
  id: string;
  customer_phone: string;
  status: "open" | "accepted" | "dismissed";
};

export type GuardrailEvent = {
  event_id: string;
  type: string;
  quote_id: string;
  timestamp: string;
};

export type SendDecision = { ok: true } | { ok: false; reason: string };

export const CONCURRENT_SEND_REASON =
  "Another user is already sending a follow-up to this customer.";

export function canSendFollowUp({
  quote,
  quotes,
  events,
  now,
}: {
  quote: GuardrailQuote;
  quotes: GuardrailQuote[];
  events: GuardrailEvent[];
  now: Date;
}): SendDecision {
  if (quote.status === "accepted" || quote.status === "dismissed") {
    return { ok: false, reason: `This quote is ${quote.status}.` };
  }

  const nowMs = now.getTime();
  const quoteIds = new Set(
    quotes
      .filter((item) => item.customer_phone === quote.customer_phone)
      .map((item) => item.id),
  );
  quoteIds.add(quote.id);

  const followUps = uniqueFollowUps(events, quoteIds);
  const mostRecent = followUps.reduce<number | null>(
    (latest, event) =>
      latest === null || event.at > latest ? event.at : latest,
    null,
  );

  if (mostRecent !== null && nowMs - mostRecent <= MINUTE_MS) {
    return {
      ok: false,
      reason: "A follow-up was sent to this customer in the last minute.",
    };
  }

  if (mostRecent !== null && nowMs - mostRecent <= COOLDOWN_MS) {
    return {
      ok: false,
      reason: "This customer got a follow-up within the last 7 days.",
    };
  }

  return { ok: true };
}

function uniqueFollowUps(events: GuardrailEvent[], quoteIds: Set<string>) {
  const seen = new Set<string>();
  const followUps: Array<GuardrailEvent & { at: number }> = [];

  for (const event of events) {
    if (
      event.type !== "message_sent" ||
      !quoteIds.has(event.quote_id) ||
      seen.has(event.event_id)
    )
      continue;
    seen.add(event.event_id);
    const at = Date.parse(event.timestamp);
    if (!Number.isFinite(at)) continue;
    followUps.push({ ...event, at });
  }

  return followUps;
}
