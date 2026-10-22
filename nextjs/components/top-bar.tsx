import { Calendar, ChevronDown, Lightbulb, Settings } from "lucide-react";
import { formatLongDate } from "@/lib/format";

export function TopBar({ asOf }: { asOf: string | null }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-4 md:px-8">
      <div className="flex items-center gap-4 text-gray-400" aria-hidden>
        <Lightbulb className="h-[18px] w-[18px]" strokeWidth={1.75} />
        <Settings className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </div>
      <div className="flex items-center gap-2">
        <div className="inline-flex h-9 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          All companies
          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
        </div>
        <div className="inline-flex h-9 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <Calendar className="h-3.5 w-3.5 text-gray-400" />
          {asOf ? formatLongDate(asOf) : "—"}
          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
