"use client";

import { ChevronDown, ChevronsUpDown, Search } from "lucide-react";

export function SearchField({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400"
        strokeWidth={1.75}
      />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="h-11 w-full rounded-xl border border-gray-200 bg-white pr-4 pl-10 text-sm text-[#1c1f26] shadow-[0_1px_2px_rgba(16,24,40,0.04)] outline-none placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-emerald-500/30"
      />
    </div>
  );
}

export function PillSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 appearance-none rounded-full border border-gray-200 bg-white pr-8 pl-3 text-sm text-gray-700 shadow-[0_1px_2px_rgba(16,24,40,0.04)] outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-gray-400" />
    </label>
  );
}

export function SectionHeading({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
      <h1 className="text-[13px] font-semibold tracking-[0.12em] text-[#1c1f26] uppercase">{title}</h1>
      <p className="text-sm text-gray-400" aria-live="polite">
        {detail}
      </p>
    </div>
  );
}

export function SortHeader({
  label,
  active,
  direction,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  direction: "asc" | "desc";
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <div
      className={align === "right" ? "flex justify-end" : "text-left"}
      role="columnheader"
      aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1 text-[11px] font-medium tracking-[0.08em] uppercase ${
          active ? "text-gray-600" : "text-gray-400 hover:text-gray-600"
        }`}
      >
        {label}
        {active ? (
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${direction === "asc" ? "rotate-180" : ""}`} />
        ) : (
          <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
        )}
      </button>
    </div>
  );
}
