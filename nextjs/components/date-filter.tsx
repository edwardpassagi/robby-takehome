"use client";

import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { isDayKey } from "@/lib/dates";
import { formatDayKey } from "@/lib/format";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function DateFilter() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const raw = params.get("date");
  const value = raw && isDayKey(raw) ? raw : "";
  const [open, setOpen] = useState(false);

  function onChange(nextValue: string) {
    const next = new URLSearchParams(params.toString());
    if (!nextValue || !isDayKey(nextValue)) next.delete("date");
    else next.set("date", nextValue);
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }
  const [cursor, setCursor] = useState(() => monthOf(value));
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setCursor(monthOf(value));
    function onPointer(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, value]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const leading = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(leading).fill(null), ...Array.from({ length: days }, (_, index) => index + 1)];

  return (
    <div ref={root} className="relative">
      <div className="inline-flex h-9 items-center rounded-full border border-gray-200 bg-white text-sm text-gray-700 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <button
          type="button"
          aria-label="Filter by date"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="inline-flex h-full items-center gap-1.5 px-3"
        >
          <Calendar className="h-3.5 w-3.5 text-gray-400" aria-hidden />
          {value ? formatDayKey(value) : "All dates"}
        </button>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear date filter"
            className="pr-2.5 text-gray-400 hover:text-gray-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
      {open ? (
        <div className="absolute top-full right-0 z-30 mt-2 w-[248px] rounded-2xl border border-gray-200 bg-white p-3 shadow-[0_12px_40px_rgba(16,24,40,0.12)]">
          <div className="flex items-center justify-between">
            <button type="button" aria-label="Previous month" onClick={() => setCursor(new Date(year, month - 1, 1))} className="rounded-full p-1 text-gray-500 hover:bg-gray-100">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-medium text-[#1c1f26]">
              {cursor.toLocaleString("en-US", { month: "long", year: "numeric" })}
            </p>
            <button type="button" aria-label="Next month" onClick={() => setCursor(new Date(year, month + 1, 1))} className="rounded-full p-1 text-gray-500 hover:bg-gray-100">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-gray-400">
            {WEEKDAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((day, index) =>
              day === null ? (
                <span key={`empty-${index}`} />
              ) : (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    onChange(dayKey(year, month, day));
                    setOpen(false);
                  }}
                  className={`h-8 rounded-full text-sm ${
                    value === dayKey(year, month, day)
                      ? "bg-[#1c1f26] font-medium text-white"
                      : "text-[#1c1f26] hover:bg-gray-100"
                  }`}
                >
                  {day}
                </button>
              ),
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function monthOf(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month] = value.split("-").map(Number);
    return new Date(year, month - 1, 1);
  }
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1);
}

function dayKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
