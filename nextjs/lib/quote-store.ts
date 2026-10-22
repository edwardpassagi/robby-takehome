import type { Quote, QuoteEvent, SentFollowUp } from "@/lib/types";

// Swap the implementation behind getQuoteStore() to move off local files.
export interface QuoteStore {
  readQuotes(): Quote[];
  readEvents(): QuoteEvent[];
  writeQuotes(quotes: Quote[]): void;
  writeEvents(events: QuoteEvent[]): void;
  readSentFollowUps(): SentFollowUp[];
  appendSentFollowUp(followUp: SentFollowUp): void;
}
