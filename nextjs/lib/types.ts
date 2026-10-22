export type QuoteStatus = "open" | "accepted" | "dismissed";

export type Quote = {
  id: string;
  customer_name: string;
  customer_phone: string;
  tech_name: string;
  amount: number;
  status: QuoteStatus;
  created_at: string;
  last_contact_at: string | null;
};

export type SentFollowUp = {
  id: string;
  quote_id: string;
  customer_name: string;
  customer_phone: string;
  message: string;
  sent_at: string;
};

export type QuoteEvent = {
  event_id: string;
  type: string;
  quote_id: string;
  timestamp: string;
  channel?: string;
  direction?: string;
};
