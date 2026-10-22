import type { Quote, QuoteEvent } from "@/lib/types";

// Swap the implementation behind getQuoteStore() to move off local files.
export interface QuoteStore {
  readQuotes(): Quote[];
  readEvents(): QuoteEvent[];
  writeQuotes(quotes: Quote[]): void;
  writeEvents(events: QuoteEvent[]): void;
}
