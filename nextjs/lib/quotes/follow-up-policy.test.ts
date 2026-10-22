import assert from "node:assert/strict";
import test from "node:test";
import { selectFollowUps, type PolicyEvent, type PolicyQuote } from "./follow-up-policy.ts";

const NOW = new Date("2026-08-16T16:00:00Z");

function quote(overrides: Partial<PolicyQuote> = {}): PolicyQuote {
  return {
    id: "Q-1",
    customer_name: "Ada",
    customer_phone: "+19175550001",
    tech_name: "Brad",
    amount: 500,
    status: "open",
    created_at: "2026-08-01T00:00:00Z",
    last_contact_at: null,
    ...overrides,
  };
}

function event(overrides: Partial<PolicyEvent> = {}): PolicyEvent {
  return {
    event_id: "evt-1",
    type: "quote_viewed",
    quote_id: "Q-1",
    timestamp: "2026-08-15T16:00:00Z",
    ...overrides,
  };
}

test("includes a quote viewed in the last 7 days when nobody responded after the view", () => {
  const result = selectFollowUps([quote()], [event()], NOW);
  assert.deepEqual(
    result.map((candidate) => candidate.reasons.map((reason) => reason.code)),
    [["viewed_no_response"]],
  );
});

test("does not use the view rule when a message or reply happened at or after the view", () => {
  const afterMessage = selectFollowUps(
    [quote()],
    [event(), event({ event_id: "sent", type: "message_sent", timestamp: "2026-08-15T16:00:00Z" })],
    NOW,
  );
  const afterReply = selectFollowUps(
    [quote()],
    [event(), event({ event_id: "reply", type: "customer_replied", timestamp: "2026-08-15T18:00:00Z" })],
    NOW,
  );
  assert.equal(afterMessage.length, 0);
  assert.equal(afterReply.length, 0);
});

test("ignores a view older than 7 days", () => {
  const result = selectFollowUps([quote()], [event({ timestamp: "2026-08-09T15:59:59Z" })], NOW);
  assert.equal(result.length, 0);
});

test("counts a duplicate view delivery once", () => {
  const view = event();
  const result = selectFollowUps([quote()], [view, { ...view }], NOW);
  assert.equal(result.length, 1);
  assert.equal(result[0].reasons.length, 1);
});

test("flags a quote over $3,000 once three days have passed without contact", () => {
  const included = selectFollowUps(
    [quote({ amount: 3001, created_at: "2026-08-13T16:00:00Z" })],
    [],
    NOW,
  );
  const tooNew = selectFollowUps(
    [quote({ amount: 3001, created_at: "2026-08-14T16:00:01Z" })],
    [],
    NOW,
  );
  const atThreshold = selectFollowUps([quote({ amount: 3000, created_at: "2026-08-01T00:00:00Z" })], [], NOW);
  const recentContact = selectFollowUps(
    [quote({ amount: 9000, last_contact_at: "2026-08-14T16:00:00Z" })],
    [],
    NOW,
  );

  assert.deepEqual(included[0]?.reasons.map((reason) => reason.code), ["large_quote_quiet"]);
  assert.equal(tooNew.length, 0);
  assert.equal(atThreshold.length, 0);
  assert.equal(recentContact.length, 0);
});

test("treats a recent reply or outbound message as contact for a large quote", () => {
  const result = selectFollowUps(
    [quote({ amount: 9000, created_at: "2026-08-01T00:00:00Z" })],
    [event({ event_id: "reply", type: "customer_replied", timestamp: "2026-08-15T00:00:00Z" })],
    NOW,
  );
  assert.equal(result.length, 0);
});

test("asks for another follow-up after more than 5 days, and stops at 3", () => {
  const one = selectFollowUps(
    [quote()],
    [event({ event_id: "m1", type: "message_sent", timestamp: "2026-08-10T16:00:00Z" })],
    NOW,
  );
  const two = selectFollowUps(
    [quote()],
    [
      event({ event_id: "m1", type: "message_sent", timestamp: "2026-08-01T00:00:00Z" }),
      event({ event_id: "m2", type: "message_sent", timestamp: "2026-08-11T15:59:59Z" }),
    ],
    NOW,
  );
  const tooSoon = selectFollowUps(
    [quote()],
    [event({ event_id: "m1", type: "message_sent", timestamp: "2026-08-11T16:00:00Z" })],
    NOW,
  );
  const capped = selectFollowUps(
    [quote()],
    [
      event({ event_id: "m1", type: "message_sent", timestamp: "2026-08-01T00:00:00Z" }),
      event({ event_id: "m2", type: "message_sent", timestamp: "2026-08-05T00:00:00Z" }),
      event({ event_id: "m3", type: "message_sent", timestamp: "2026-08-09T00:00:00Z" }),
    ],
    NOW,
  );

  assert.equal(one[0].reasons[0].text, "Last follow-up was more than 5 days ago (1 of 3).");
  assert.equal(two[0].reasons[0].text, "Last follow-up was more than 5 days ago (2 of 3).");
  assert.equal(tooSoon.length, 0);
  assert.equal(capped.length, 0);
});

test("does not count a repeated message_sent delivery as a second follow-up", () => {
  const sent = event({ event_id: "m1", type: "message_sent", timestamp: "2026-08-10T00:00:00Z" });
  const result = selectFollowUps([quote()], [sent, { ...sent }], NOW);
  assert.equal(result[0].reasons[0].text, "Last follow-up was more than 5 days ago (1 of 3).");
});

test("skips accepted and dismissed quotes", () => {
  const result = selectFollowUps(
    [quote({ id: "Q-A", status: "accepted" }), quote({ id: "Q-D", status: "dismissed" })],
    [
      event({ quote_id: "Q-A" }),
      event({ event_id: "view-d", quote_id: "Q-D" }),
    ],
    NOW,
  );
  assert.equal(result.length, 0);
});

test("keeps every matching reason and ranks a fresh view ahead of a quiet large quote", () => {
  const hot = quote({ id: "Q-hot", amount: 400 });
  const quiet = quote({ id: "Q-quiet", amount: 20000, created_at: "2026-08-01T00:00:00Z" });
  const both = quote({ id: "Q-both", amount: 8000, created_at: "2026-08-01T00:00:00Z" });
  const result = selectFollowUps(
    [quiet, hot, both],
    [event({ quote_id: "Q-hot" }), event({ event_id: "view-both", quote_id: "Q-both" })],
    NOW,
  );

  assert.deepEqual(
    result.map((candidate) => candidate.quote.id),
    ["Q-both", "Q-hot", "Q-quiet"],
  );
  assert.deepEqual(
    result[0].reasons.map((reason) => reason.code),
    ["viewed_no_response", "large_quote_quiet"],
  );
});
