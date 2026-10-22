"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatDayKey } from "@/lib/format";

export function DateFilterEmpty({ noun, day }: { noun: string; day: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  function clear() {
    const next = new URLSearchParams(params.toString());
    next.delete("date");
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
      <p className="text-sm text-gray-500">No {noun} for {formatDayKey(day)}.</p>
      <button
        type="button"
        onClick={clear}
        className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-[#1c1f26] shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:bg-gray-50"
      >
        Clear date filter
      </button>
    </div>
  );
}
