"use server";

import { readEvents } from "@/app/events/action";
import { canSendFollowUp, CONCURRENT_SEND_REASON, type SendDecision } from "@/lib/quotes/guardrails";
import { selectFollowUps, type FollowUpCandidate } from "@/lib/quotes/follow-up-policy";
import { acquireSendLock } from "@/lib/quotes/send-lock";
import { getQuoteStore } from "@/lib/storage";
import type { Quote, QuoteEvent, SentFollowUp } from "@/lib/types";
import { draftFollowUpSms } from "@/lib/genai/follow-up-draft";

export async function readQuotes(): Promise<Quote[]> {
  return getQuoteStore().readQuotes();
}

export async function writeQuotes(quotes: Quote[]): Promise<void> {
  if (!Array.isArray(quotes)) {
    throw new Error("quotes must be an array");
  }
  getQuoteStore().writeQuotes(quotes);
}

export async function readFollowUps(asOf?: string): Promise<{ asOf: string; candidates: FollowUpCandidate<Quote>[] }> {
  const quotes = await readQuotes();
  const now = asOfDate(asOf);
  const combined = withSentFollowUps(await readEvents(), getQuoteStore().readSentFollowUps()).filter(
    (event) => Date.parse(event.timestamp) <= now.getTime(),
  );
  return {
    asOf: now.toISOString(),
    candidates: selectFollowUps(quotes, combined, now),
  };
}

export async function readSentFollowUps(): Promise<SentFollowUp[]> {
  return getQuoteStore().readSentFollowUps();
}

export async function generateFollowUpDraft(quoteId: string, asOf?: string): Promise<{ message: string }> {
  const quotes = await readQuotes();
  const quote = quotes.find((item) => item.id === quoteId);
  if (!quote) throw new Error("This quote does not exist.");

  const now = asOfDate(asOf);
  const combined = withSentFollowUps(await readEvents(), getQuoteStore().readSentFollowUps()).filter(
    (event) => Date.parse(event.timestamp) <= now.getTime(),
  );
  const match = selectFollowUps(quotes, combined, now).find((candidate) => candidate.quote.id === quoteId);

  const message = await draftFollowUpSms({
    customerName: quote.customer_name,
    techName: quote.tech_name,
    amount: quote.amount,
    reasonCodes: match?.reasons.map((reason) => reason.code) ?? [],
  });
  return { message };
}

export async function attemptFollowUpSend(quoteId: string, message: string): Promise<SendDecision> {
  const trimmed = message.trim();
  if (!trimmed) return { ok: false, reason: "Write a message before sending." };

  const quotes = await readQuotes();
  const quote = quotes.find((item) => item.id === quoteId);
  if (!quote) return { ok: false, reason: "This quote does not exist." };

  const lock = acquireSendLock(quote.customer_phone);
  if (!lock.acquired) return { ok: false, reason: CONCURRENT_SEND_REASON };

  try {
    const store = getQuoteStore();
    const now = new Date();
    const combined = withSentFollowUps(store.readEvents(), store.readSentFollowUps());
    const decision = canSendFollowUp({ quote, quotes: store.readQuotes(), events: combined, now });
    if (!decision.ok) return decision;

    const id = crypto.randomUUID();
    const sentAt = now.toISOString();
    store.appendSentFollowUp({
      id,
      quote_id: quote.id,
      customer_name: quote.customer_name,
      customer_phone: quote.customer_phone,
      message: trimmed,
      sent_at: sentAt,
    });
    store.writeEvents([
      ...store.readEvents(),
      {
        event_id: id,
        type: "message_sent",
        quote_id: quote.id,
        timestamp: sentAt,
        channel: "sms",
        direction: "outbound",
      },
    ]);
    store.writeQuotes(
      store.readQuotes().map((item) => (item.id === quote.id ? { ...item, last_contact_at: sentAt } : item)),
    );
    return { ok: true };
  } finally {
    lock.release();
  }
}

function asOfDate(asOf?: string) {
  if (!asOf) return new Date();
  const parsed = new Date(asOf);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function withSentFollowUps(events: QuoteEvent[], sent: SentFollowUp[]): QuoteEvent[] {
  return [
    ...events,
    ...sent.map((item) => ({
      event_id: item.id,
      type: "message_sent",
      quote_id: item.quote_id,
      timestamp: item.sent_at,
      channel: "sms",
      direction: "outbound",
    })),
  ];
}
