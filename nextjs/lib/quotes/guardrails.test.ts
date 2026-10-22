import assert from "node:assert/strict";
import test from "node:test";
import { canSendFollowUp, type GuardrailEvent, type GuardrailQuote } from "./guardrails.ts";

const NOW = new Date("2026-08-16T16:00:00Z");

function quote(overrides: Partial<GuardrailQuote> = {}): GuardrailQuote {
  return {
    id: "Q-1",
    customer_phone: "+19175550001",
    status: "open",
    ...overrides,
  };
}

function sent(overrides: Partial<GuardrailEvent> = {}): GuardrailEvent {
  return {
    event_id: "sent-1",
    type: "message_sent",
    quote_id: "Q-1",
    timestamp: "2026-08-01T00:00:00Z",
    ...overrides,
  };
}

test("allows an open quote with no recent follow-up", () => {
  const decision = canSendFollowUp({
    quote: quote(),
    quotes: [quote()],
    events: [sent({ timestamp: "2026-08-09T15:59:59Z" })],
    now: NOW,
  });
  assert.deepEqual(decision, { ok: true });
});

test("blocks accepted and dismissed quotes", () => {
  const accepted = canSendFollowUp({
    quote: quote({ status: "accepted" }),
    quotes: [quote({ status: "accepted" })],
    events: [],
    now: NOW,
  });
  const dismissed = canSendFollowUp({
    quote: quote({ status: "dismissed" }),
    quotes: [quote({ status: "dismissed" })],
    events: [],
    now: NOW,
  });
  assert.equal(accepted.ok, false);
  assert.equal(dismissed.ok, false);
  if (!accepted.ok) assert.match(accepted.reason, /accepted/);
  if (!dismissed.ok) assert.match(dismissed.reason, /dismissed/);
});

test("blocks a retry when this customer was messaged in the last minute", () => {
  const otherQuote = quote({ id: "Q-2" });
  const decision = canSendFollowUp({
    quote: quote(),
    quotes: [quote(), otherQuote],
    events: [sent({ quote_id: "Q-2", timestamp: "2026-08-16T15:59:30Z" })],
    now: NOW,
  });
  assert.equal(decision.ok, false);
  if (!decision.ok) assert.match(decision.reason, /last minute/);
});

test("blocks a customer who got a follow-up within 7 days, including on another quote", () => {
  const decision = canSendFollowUp({
    quote: quote(),
    quotes: [quote(), quote({ id: "Q-2" })],
    events: [sent({ event_id: "other", quote_id: "Q-2", timestamp: "2026-08-09T16:00:00Z" })],
    now: NOW,
  });
  assert.equal(decision.ok, false);
  if (!decision.ok) assert.match(decision.reason, /7 days/);
});

test("does not let a duplicate delivery of an old send look like a new one", () => {
  const old = sent({ timestamp: "2026-08-01T00:00:00Z" });
  const decision = canSendFollowUp({
    quote: quote(),
    quotes: [quote()],
    events: [old, { ...old }],
    now: NOW,
  });
  assert.deepEqual(decision, { ok: true });
});

test("does not apply one customer's follow-up to a different phone", () => {
  const decision = canSendFollowUp({
    quote: quote(),
    quotes: [quote(), quote({ id: "Q-9", customer_phone: "+19175559999" })],
    events: [sent({ quote_id: "Q-9", timestamp: "2026-08-16T15:59:30Z" })],
    now: NOW,
  });
  assert.deepEqual(decision, { ok: true });
});
