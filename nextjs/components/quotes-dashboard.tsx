"use client";

import { Info } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { PillSelect, SearchField, SectionHeading, SortHeader } from "@/components/controls";
import { formatDateTime, formatMoney, formatPhone, formatStatus, statusClass } from "@/lib/format";
import { ease } from "@/lib/motion";
import type { Quote } from "@/lib/types";

type SortKey = "customer_name" | "tech_name" | "amount" | "status" | "created_at" | "last_contact_at";

const columns =
  "grid grid-cols-[minmax(190px,1.6fr)_104px_92px_96px_148px_148px_72px] items-center gap-3";

export function QuotesDashboard({ quotes }: { quotes: Quote[] }) {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [tech, setTech] = useState("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "created_at",
    dir: "desc",
  });

  const techs = useMemo(
    () => [...new Set(quotes.map((quote) => quote.tech_name))].sort((a, b) => a.localeCompare(b)),
    [quotes],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const needleDigits = needle.replace(/\D/g, "");
    const next = quotes.filter((quote) => {
      if (status !== "all" && quote.status !== status) return false;
      if (tech !== "all" && quote.tech_name !== tech) return false;
      if (!needle) return true;
      const phoneDigits = quote.customer_phone.replace(/\D/g, "");
      return (
        quote.customer_name.toLowerCase().includes(needle) ||
        quote.id.toLowerCase().includes(needle) ||
        quote.tech_name.toLowerCase().includes(needle) ||
        (needleDigits.length > 0 && phoneDigits.includes(needleDigits))
      );
    });

    const dir = sort.dir === "asc" ? 1 : -1;
    next.sort((a, b) => {
      switch (sort.key) {
        case "amount":
          return (a.amount - b.amount) * dir;
        case "created_at":
          return a.created_at.localeCompare(b.created_at) * dir;
        case "last_contact_at":
          return compareNullable(a.last_contact_at, b.last_contact_at, dir);
        case "customer_name":
          return a.customer_name.localeCompare(b.customer_name) * dir;
        case "tech_name":
          return a.tech_name.localeCompare(b.tech_name) * dir;
        case "status":
          return a.status.localeCompare(b.status) * dir;
        default:
          return 0;
      }
    });
    return next;
  }, [quotes, query, status, sort, tech]);

  const open = quotes.filter((quote) => quote.status === "open");
  const accepted = quotes.filter((quote) => quote.status === "accepted").length;
  const dismissed = quotes.filter((quote) => quote.status === "dismissed").length;
  const pipeline = open.reduce((sum, quote) => sum + quote.amount, 0);
  const average = open.length ? Math.round(pipeline / open.length) : 0;
  const openShare = quotes.length ? (open.length / quotes.length) * 100 : 0;

  function toggleSort(key: SortKey) {
    setSort((current) => {
      if (current.key === key) {
        return { key, dir: current.dir === "asc" ? "desc" : "asc" };
      }
      const descFirst = key === "amount" || key === "created_at" || key === "last_contact_at";
      return { key, dir: descFirst ? "desc" : "asc" };
    });
  }

  const detail =
    filtered.length === quotes.length ? `${quotes.length} quotes` : `${filtered.length} of ${quotes.length}`;
  const filtersActive = query !== "" || status !== "all" || tech !== "all";

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <motion.section
          className="rounded-2xl border border-gray-200/80 bg-white px-6 py-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.4, ease }}
        >
          <div className="flex items-center justify-between gap-3 text-[11px] font-semibold tracking-[0.14em] text-gray-400 uppercase">
            <span>Open quotes</span>
            <span className="text-xs font-medium tracking-normal text-gray-400 normal-case">{quotes.length} total</span>
          </div>
          <p className="mt-3 text-[42px] leading-none font-semibold tracking-tight text-[#1c1f26] tabular-nums">
            {open.length}
          </p>
          <p className="mt-1.5 text-sm text-gray-500">open</p>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-gray-200">
            <motion.div
              className="h-full rounded-full bg-emerald-500"
              initial={reduce ? false : { width: 0 }}
              animate={{ width: `${openShare}%` }}
              transition={{ duration: reduce ? 0 : 0.7, ease, delay: reduce ? 0 : 0.1 }}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            <Legend dot="bg-emerald-500" label="Open" value={open.length} />
            <Legend dot="bg-emerald-900/35" label="Accepted" value={accepted} />
            <Legend dot="bg-gray-300" label="Dismissed" value={dismissed} />
          </div>
        </motion.section>

        <motion.section
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2fbf74] to-[#149455] px-6 py-5 text-white shadow-[0_10px_28px_rgba(20,148,85,0.2)]"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.45, delay: reduce ? 0 : 0.06, ease }}
        >
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-white/80 uppercase">
            <Info className="h-3.5 w-3.5" strokeWidth={2.25} />
            Revenue opportunity
          </div>
          <p className="mt-4 text-[40px] leading-none font-semibold tracking-tight tabular-nums">
            {formatMoney(pipeline)}
          </p>
          <p className="mt-3 text-sm text-white/85">
            {open.length} open {open.length === 1 ? "quote" : "quotes"} · {formatMoney(average)} avg
          </p>
        </motion.section>
      </div>

      <SearchField
        value={query}
        onChange={setQuery}
        label="Search quotes"
        placeholder="Search by name, phone, tech, or quote"
      />

      <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
        <SectionHeading title="Quotes" detail={detail} />
        <div className="flex flex-wrap items-center gap-2">
          <PillSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: "all", label: "All statuses" },
              { value: "open", label: "Open" },
              { value: "accepted", label: "Accepted" },
              { value: "dismissed", label: "Dismissed" },
            ]}
          />
          <PillSelect
            label="Tech"
            value={tech}
            onChange={setTech}
            options={[{ value: "all", label: "All techs" }, ...techs.map((name) => ({ value: name, label: name }))]}
          />
          {filtersActive ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setStatus("all");
                setTech("all");
              }}
              className="h-9 px-2 text-sm text-gray-500 hover:text-gray-800"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="overflow-x-auto">
          <div className="min-w-[980px]" role="table" aria-label="Quotes">
            <div className={`${columns} px-5 py-3`} role="row">
              <SortHeader label="Customer" active={sort.key === "customer_name"} direction={sort.dir} onClick={() => toggleSort("customer_name")} />
              <SortHeader label="Tech" active={sort.key === "tech_name"} direction={sort.dir} onClick={() => toggleSort("tech_name")} />
              <SortHeader label="Amount" align="right" active={sort.key === "amount"} direction={sort.dir} onClick={() => toggleSort("amount")} />
              <SortHeader label="Status" active={sort.key === "status"} direction={sort.dir} onClick={() => toggleSort("status")} />
              <SortHeader label="Created" active={sort.key === "created_at"} direction={sort.dir} onClick={() => toggleSort("created_at")} />
              <SortHeader label="Last contact" active={sort.key === "last_contact_at"} direction={sort.dir} onClick={() => toggleSort("last_contact_at")} />
              <div role="columnheader" className="text-right text-[11px] font-medium tracking-[0.08em] text-gray-400 uppercase">
                Quote
              </div>
            </div>
            <AnimatePresence initial={false} mode="popLayout">
              {filtered.map((quote) => (
                <motion.div
                  key={quote.id}
                  role="row"
                  className={`${columns} border-t border-gray-100 px-5 py-3.5 hover:bg-[#fafbfc]`}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.2, ease }}
                >
                  <div className="min-w-0" role="cell">
                    <p className="truncate font-medium text-[#1c1f26]">{quote.customer_name}</p>
                    <p className="mt-0.5 text-xs text-gray-400 tabular-nums">{formatPhone(quote.customer_phone)}</p>
                  </div>
                  <div className="text-sm text-gray-600" role="cell">
                    {quote.tech_name}
                  </div>
                  <div className="text-right text-sm font-medium text-[#1c1f26] tabular-nums" role="cell">
                    {formatMoney(quote.amount)}
                  </div>
                  <div className={`text-sm font-medium ${statusClass(quote.status)}`} role="cell">
                    {formatStatus(quote.status)}
                  </div>
                  <div className="text-sm text-gray-500 tabular-nums" role="cell" title={quote.created_at}>
                    {formatDateTime(quote.created_at)}
                  </div>
                  <div className={`text-sm tabular-nums ${quote.last_contact_at ? "text-gray-500" : "text-gray-300"}`} role="cell" title={quote.last_contact_at ?? "No contact yet"}>
                    {quote.last_contact_at ? formatDateTime(quote.last_contact_at) : "—"}
                  </div>
                  <div className="text-right text-xs text-gray-400 tabular-nums" role="cell">
                    {quote.id}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filtered.length === 0 ? (
              <p className="px-5 py-16 text-center text-sm text-gray-400">Nothing matches these filters.</p>
            ) : null}
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-400">Times shown in UTC.</p>
    </div>
  );
}

function Legend({ dot, label, value }: { dot: string; label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
      <span className="font-medium text-gray-700 tabular-nums">{value}</span>
    </span>
  );
}

function compareNullable(a: string | null, b: string | null, dir: number) {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a.localeCompare(b) * dir;
}
