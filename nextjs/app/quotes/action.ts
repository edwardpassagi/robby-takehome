"use server";

import { getQuoteStore } from "@/lib/storage";
import type { Quote } from "@/lib/types";

export async function readQuotes(): Promise<Quote[]> {
  return getQuoteStore().readQuotes();
}

export async function writeQuotes(quotes: Quote[]): Promise<void> {
  if (!Array.isArray(quotes)) {
    throw new Error("quotes must be an array");
  }
  getQuoteStore().writeQuotes(quotes);
}
