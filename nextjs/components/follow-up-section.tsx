"use client";

import { AlertTriangle, ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { FollowUpButton } from "@/components/follow-up-button";
import { formatMoney } from "@/lib/format";
import { ease } from "@/lib/motion";
import type { FollowUpCandidate } from "@/lib/quotes/follow-up-policy";
import type { Quote } from "@/lib/types";

const PREVIEW_COUNT = 2;

export type FollowUpState =
  | { status: "loading" }
  | { status: "ready"; asOf: string; candidates: FollowUpCandidate<Quote>[] }
  | { status: "error" };

export function FollowUpSection({
  state,
  onFollowUp,
}: {
  state: FollowUpState;
  onFollowUp: (quoteId: string) => void;
}) {
  const reduce = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const candidates = state.status === "ready" ? state.candidates : [];
  const hiddenCount = Math.max(0, candidates.length - PREVIEW_COUNT);
  const visible = expanded ? candidates : candidates.slice(0, PREVIEW_COUNT);

  return (
    <section aria-labelledby="follow-up-heading" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700" aria-hidden />
        <h2 id="follow-up-heading" className="text-sm font-semibold text-amber-950">
          We think we should follow-up on these
        </h2>
        {state.status === "ready" ? (
          <p className="text-sm text-amber-800/80" aria-live="polite">
            {candidates.length} {candidates.length === 1 ? "quote" : "quotes"}
          </p>
        ) : null}
        {hiddenCount > 0 ? (
          <button
            type="button"
            className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-amber-950 hover:text-amber-800"
            aria-expanded={expanded}
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? "Show less" : `Show ${hiddenCount} more`}
            <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden />
          </button>
        ) : null}
      </div>

      {state.status === "loading" ? (
        <div className="mt-3 space-y-2" aria-busy="true" aria-live="polite">
          <p className="text-sm text-amber-800/80">Checking which quotes need a follow-up</p>
          <div className="h-10 animate-pulse rounded-lg bg-amber-100" />
          <div className="h-10 animate-pulse rounded-lg bg-amber-100/80" />
        </div>
      ) : null}

      {state.status === "error" ? (
        <p className="mt-2 text-sm text-amber-950">The follow-up list could not be calculated.</p>
      ) : null}

      {state.status === "ready" && candidates.length === 0 ? (
        <p className="mt-2 text-sm text-amber-900">No quotes need a follow-up right now.</p>
      ) : null}

      {state.status === "ready" && visible.length > 0 ? (
        <motion.ul
          key={expanded ? "all" : "preview"}
          className="mt-2"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduce ? 0 : 0.25, ease }}
        >
          {visible.map((candidate) => (
            <li key={candidate.quote.id} className="flex items-start justify-between gap-3 border-t border-amber-200/80 py-2.5 first:border-t-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-amber-950">
                  {candidate.quote.customer_name}
                  <span className="ml-2 font-normal text-amber-800/70 tabular-nums">{formatMoney(candidate.quote.amount)}</span>
                  <span className="ml-2 font-normal text-amber-800/60 tabular-nums">{candidate.quote.id}</span>
                </p>
                <p className="mt-0.5 text-xs leading-snug text-amber-900/80">{candidate.reasons.map((reason) => reason.text).join(" ")}</p>
              </div>
              <FollowUpButton customerName={candidate.quote.customer_name} onClick={() => onFollowUp(candidate.quote.id)} />
            </li>
          ))}
        </motion.ul>
      ) : null}
    </section>
  );
}
