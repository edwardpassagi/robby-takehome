import "server-only";

import fs from "fs";
import path from "path";
import type { QuoteStore } from "@/lib/quote-store";
import type { Quote, QuoteEvent, SentFollowUp } from "@/lib/types";

// seed/ stays at the repo root. storage/ is the Next app's local database.
const repoRoot = path.resolve(process.cwd(), "..");
const storageDir = path.join(process.cwd(), "storage");
const quotesPath = path.join(storageDir, "quotes.json");
const eventsPath = path.join(storageDir, "events.json");
const followUpsPath = path.join(storageDir, "follow-ups.json");
const seedQuotesPath = path.join(repoRoot, "seed", "quotes.json");
const seedEventsPath = path.join(repoRoot, "seed", "events.jsonl");

// storage/ is the local database. It is created from seed/ the first time
// the app reads it. Delete the folder to reset.
function ensureStorage() {
  fs.mkdirSync(storageDir, { recursive: true });

  if (!fs.existsSync(quotesPath)) {
    if (!fs.existsSync(seedQuotesPath)) {
      throw new Error(`Missing seed file at ${seedQuotesPath}`);
    }
    const raw = fs.readFileSync(seedQuotesPath, "utf8");
    writeAtomic(quotesPath, raw);
  }

  if (!fs.existsSync(eventsPath)) {
    if (!fs.existsSync(seedEventsPath)) {
      throw new Error(`Missing seed file at ${seedEventsPath}`);
    }
    const events = parseEventsJsonl(fs.readFileSync(seedEventsPath, "utf8"));
    writeAtomic(eventsPath, JSON.stringify(events, null, 2) + "\n");
  }

  if (!fs.existsSync(followUpsPath)) {
    writeAtomic(followUpsPath, "[]\n");
  }
}

function writeAtomic(file: string, contents: string) {
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, contents);
  fs.renameSync(tmp, file);
}

function parseEventsJsonl(raw: string): QuoteEvent[] {
  const events: QuoteEvent[] = [];
  const lines = raw.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
      events.push(JSON.parse(line) as QuoteEvent);
    } catch {
      throw new Error(`seed/events.jsonl line ${i + 1} is not valid JSON`);
    }
  }

  return events;
}

function readJsonArray<T>(file: string, label: string): T[] {
  const data: unknown = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(data)) {
    throw new Error(`${label} must be a JSON array`);
  }
  return data as T[];
}

function writeJson(file: string, data: unknown) {
  fs.mkdirSync(storageDir, { recursive: true });
  writeAtomic(file, JSON.stringify(data, null, 2) + "\n");
}

const fileQuoteStore: QuoteStore = {
  readQuotes() {
    ensureStorage();
    return readJsonArray<Quote>(quotesPath, "storage/quotes.json");
  },
  readEvents() {
    ensureStorage();
    return readJsonArray<QuoteEvent>(eventsPath, "storage/events.json");
  },
  writeQuotes(quotes) {
    writeJson(quotesPath, quotes);
  },
  writeEvents(events) {
    writeJson(eventsPath, events);
  },
  readSentFollowUps() {
    ensureStorage();
    return readJsonArray<SentFollowUp>(followUpsPath, "storage/follow-ups.json");
  },
  appendSentFollowUp(followUp) {
    const current = this.readSentFollowUps();
    writeJson(followUpsPath, [...current, followUp]);
  },
};

export function getQuoteStore(): QuoteStore {
  return fileQuoteStore;
}
