"use client";

import { Loader2, WandSparkles, X } from "lucide-react";
import { useEffect } from "react";
import { formatPhone } from "@/lib/format";

export type DraftModalState =
  | {
      status: "loading";
      quoteId: string;
      customerName: string;
      customerPhone: string;
    }
  | {
      status: "error";
      quoteId: string;
      customerName: string;
      customerPhone: string;
      message: string;
    }
  | {
      status: "ready";
      quoteId: string;
      customerName: string;
      customerPhone: string;
      body: string;
      sending: boolean;
      sendError: string | null;
    };

export function FollowUpDraftModal({
  state,
  onBodyChange,
  onClose,
  onSend,
}: {
  state: DraftModalState;
  onBodyChange: (body: string) => void;
  onClose: () => void;
  onSend: () => void;
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && state.status !== "ready") onClose();
      if (event.key === "Escape" && state.status === "ready" && !state.sending)
        onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, state]);

  const busy =
    state.status === "loading" || (state.status === "ready" && state.sending);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c1f26]/40 p-4"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="draft-title"
        className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-[0_16px_50px_rgba(16,24,40,0.18)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-4 text-blue-700">
              <p className="text-xs font-semibold tracking-[0.12em] uppercase">
                Message draft
              </p>
            </div>
            <h2
              id="draft-title"
              className="mt-2 text-lg font-semibold text-[#1c1f26]"
            >
              {state.customerName}
            </h2>
            <p className="text-sm text-gray-500 tabular-nums">
              {formatPhone(state.customerPhone)}
            </p>
          </div>
          <button
            type="button"
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {state.status === "loading" ? (
          <div
            className="mt-5 rounded-xl bg-blue-50 px-4 py-8 text-center"
            aria-busy="true"
            aria-live="polite"
          >
            <Loader2
              className="mx-auto h-5 w-5 animate-spin text-blue-700"
              aria-hidden
            />
            <p className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-blue-950">
              <WandSparkles className="h-4 w-4" aria-hidden />
              Generating message draft
            </p>
          </div>
        ) : null}

        {state.status === "error" ? (
          <p className="mt-5 text-sm text-red-700">{state.message}</p>
        ) : null}

        {state.status === "ready" ? (
          <>
            <label
              className="mt-5 block text-xs font-medium tracking-wide text-gray-400 uppercase"
              htmlFor="draft-body"
            >
              SMS
            </label>
            <textarea
              id="draft-body"
              value={state.body}
              onChange={(event) => onBodyChange(event.target.value)}
              rows={5}
              disabled={state.sending}
              className="mt-2 w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm text-[#1c1f26] outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
            />
            {state.sendError ? (
              <p className="mt-3 text-sm text-red-700" role="alert">
                {state.sendError}
              </p>
            ) : null}
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={onSend}
                disabled={state.sending || state.body.trim().length === 0}
                className="inline-flex h-9 items-center rounded-full bg-[#1c1f26] px-4 text-sm font-medium text-white hover:bg-[#2c3040] disabled:opacity-40"
              >
                {state.sending ? "Sending" : "Send"}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
