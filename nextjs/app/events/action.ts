"use server";

import { getQuoteStore } from "@/lib/storage";
import type { QuoteEvent } from "@/lib/types";

export async function readEvents(): Promise<QuoteEvent[]> {
  return getQuoteStore().readEvents();
}

export async function writeEvents(events: QuoteEvent[]): Promise<void> {
  if (!Array.isArray(events)) {
    throw new Error("events must be an array");
  }
  getQuoteStore().writeEvents(events);
}

export async function latestEventTimestamp(): Promise<string | null> {
  let latest: string | null = null;
  for (const event of await readEvents()) {
    if (latest === null || event.timestamp > latest) latest = event.timestamp;
  }
  return latest;
}
