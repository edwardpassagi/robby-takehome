"use client";

import { ArrowRight } from "lucide-react";

export function FollowUpButton({
  customerName,
  onClick,
}: {
  customerName: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-[#1c1f26] px-3 text-xs font-medium whitespace-nowrap text-white hover:bg-[#2c3040]"
      onClick={onClick}
    >
      Follow-up
      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      <span className="sr-only"> with {customerName}</span>
    </button>
  );
}
