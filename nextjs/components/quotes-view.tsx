"use client";

import { useEffect, useState } from "react";
import { attemptFollowUpSend, generateFollowUpDraft, readFollowUps, readQuotes, readSentFollowUps } from "@/app/quotes/action";
import { FollowUpDraftModal, type DraftModalState } from "@/components/follow-up-draft-modal";
import { FollowUpSection, type FollowUpState } from "@/components/follow-up-section";
import { QuotesDashboard } from "@/components/quotes-dashboard";
import type { Quote, SentFollowUp } from "@/lib/types";

export function QuotesView({ quotes: initialQuotes, asOf }: { quotes: Quote[]; asOf: string }) {
  const [quotes, setQuotes] = useState(initialQuotes);
  const [followUps, setFollowUps] = useState<FollowUpState>({ status: "loading" });
  const [sent, setSent] = useState<SentFollowUp[]>([]);
  const [draft, setDraft] = useState<DraftModalState | null>(null);

  useEffect(() => {
    let cancelled = false;
    setFollowUps({ status: "loading" });
    Promise.all([readFollowUps(asOf), readSentFollowUps()])
      .then(([candidates, sentFollowUps]) => {
        if (cancelled) return;
        setFollowUps({ status: "ready", ...candidates });
        setSent(sentFollowUps);
      })
      .catch(() => {
        if (!cancelled) setFollowUps({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [asOf]);

  const followUpIds = followUps.status === "ready" ? followUps.candidates.map((candidate) => candidate.quote.id) : [];

  function openDraft(quoteId: string) {
    const quote = quotes.find((item) => item.id === quoteId);
    if (!quote) return;
    setDraft({ status: "loading", quoteId, customerName: quote.customer_name, customerPhone: quote.customer_phone });
    generateFollowUpDraft(quoteId, asOf)
      .then((result) => {
        setDraft({
          status: "ready",
          quoteId,
          customerName: quote.customer_name,
          customerPhone: quote.customer_phone,
          body: result.message,
          sending: false,
          sendError: null,
        });
      })
      .catch((error: unknown) => {
        setDraft({
          status: "error",
          quoteId,
          customerName: quote.customer_name,
          customerPhone: quote.customer_phone,
          message: error instanceof Error ? error.message : "The draft could not be generated.",
        });
      });
  }

  async function sendDraft() {
    if (draft?.status !== "ready") return;
    setDraft({ ...draft, sending: true, sendError: null });
    const decision = await attemptFollowUpSend(draft.quoteId, draft.body);
    if (!decision.ok) {
      setDraft({ ...draft, sending: false, sendError: decision.reason });
      return;
    }
    const [candidates, sentFollowUps, nextQuotes] = await Promise.all([
      readFollowUps(asOf),
      readSentFollowUps(),
      readQuotes(),
    ]);
    setFollowUps({ status: "ready", ...candidates });
    setSent(sentFollowUps);
    setQuotes(nextQuotes);
    setDraft(null);
  }

  const visibleQuotes = quotes;
  const visibleSent = sent;

  return (
    <div className="flex flex-col gap-4">
      <FollowUpSection state={followUps} onFollowUp={openDraft} />
      <QuotesDashboard quotes={visibleQuotes} followUpIds={followUpIds} sentFollowUps={visibleSent} onFollowUp={openDraft} />
      {draft ? (
        <FollowUpDraftModal
          state={draft}
          onBodyChange={(body) => {
            setDraft((current) => (current?.status === "ready" ? { ...current, body } : current));
          }}
          onClose={() => {
            if (draft.status === "ready" && draft.sending) return;
            setDraft(null);
          }}
          onSend={() => {
            void sendDraft();
          }}
        />
      ) : null}
    </div>
  );
}
