"use client";

import { motion, useReducedMotion } from "motion/react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { PillSelect, SearchField, SectionHeading, SortHeader } from "@/components/controls";
import { DateFilter } from "@/components/date-filter";
import { DateFilterEmpty } from "@/components/date-filter-empty";
import { localDayKey } from "@/lib/dates";
import { EVENT_TYPES, eventTypeClass, formatChannel, formatDay, formatEventType, formatTime } from "@/lib/format";
import { ease } from "@/lib/motion";
import type { Quote, QuoteEvent } from "@/lib/types";

type SortKey = "timestamp" | "type" | "quote_id" | "customer" | "channel";

const columns = "grid grid-cols-[88px_168px_84px_minmax(160px,1fr)_88px] items-center gap-3";

type TaggedEvent = QuoteEvent & { rowKey: string; customer: string };

export function EventsDashboard({ events, quotes, day = null }: { events: QuoteEvent[]; quotes: Quote[]; day?: string | null }) {
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [channel, setChannel] = useState("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "timestamp",
    dir: "desc",
  });

  useEffect(() => {
    setReady(true);
  }, []);

  const quoteById = useMemo(() => {
    const map = new Map<string, Quote>();
    for (const quote of quotes) map.set(quote.id, quote);
    return map;
  }, [quotes]);

  const repeatedIds = useMemo(() => {
    const seen = new Set<string>();
    const repeated = new Set<string>();
    for (const event of events) {
      if (seen.has(event.event_id)) repeated.add(event.event_id);
      seen.add(event.event_id);
    }
    return repeated;
  }, [events]);

  const tagged = useMemo<TaggedEvent[]>(
    () =>
      events.map((event, index) => ({
        ...event,
        rowKey: `${event.event_id}:${index}`,
        customer: quoteById.get(event.quote_id)?.customer_name ?? "—",
      })),
    [events, quoteById],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const next = tagged.filter((event) => {
      if (type !== "all" && event.type !== type) return false;
      if (channel === "none" && event.channel) return false;
      if (channel !== "all" && channel !== "none" && event.channel !== channel) return false;
      if (!needle) return true;
      return (
        event.quote_id.toLowerCase().includes(needle) ||
        event.event_id.toLowerCase().includes(needle) ||
        event.type.toLowerCase().includes(needle) ||
        event.customer.toLowerCase().includes(needle) ||
        formatEventType(event.type).toLowerCase().includes(needle)
      );
    });

    const dir = sort.dir === "asc" ? 1 : -1;
    next.sort((a, b) => {
      switch (sort.key) {
        case "timestamp":
          return a.timestamp.localeCompare(b.timestamp) * dir;
        case "type":
          return formatEventType(a.type).localeCompare(formatEventType(b.type)) * dir;
        case "quote_id":
          return a.quote_id.localeCompare(b.quote_id) * dir;
        case "customer":
          return a.customer.localeCompare(b.customer) * dir;
        case "channel":
          return (a.channel ?? "").localeCompare(b.channel ?? "") * dir;
        default:
          return 0;
      }
    });
    return next;
  }, [channel, query, sort, tagged, type]);

  const counts = useMemo(() => {
    const tally: Record<string, number> = {};
    for (const event of events) tally[event.type] = (tally[event.type] ?? 0) + 1;
    return tally;
  }, [events]);

  const viewCount = counts.quote_viewed ?? 0;
  const uniqueCount = new Set(events.map((event) => event.event_id)).size;
  const repeatCount = events.length - uniqueCount;

  function toggleSort(key: SortKey) {
    setSort((current) => {
      if (current.key === key) {
        return { key, dir: current.dir === "asc" ? "desc" : "asc" };
      }
      return { key, dir: key === "timestamp" ? "desc" : "asc" };
    });
  }

  const detail =
    filtered.length === events.length ? `${events.length} events` : `${filtered.length} of ${events.length}`;
  const filtersActive = query !== "" || type !== "all" || channel !== "all";
  const listKey = `${query}|${type}|${channel}|${sort.key}|${sort.dir}`;
  const animateList = ready && !reduce;

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
            <span>Event stream</span>
            <span className="text-xs font-medium tracking-normal text-gray-400 normal-case">
              {uniqueCount} unique
            </span>
          </div>
          <p className="mt-3 text-[42px] leading-none font-semibold tracking-tight text-[#1c1f26] tabular-nums">
            {events.length}
          </p>
          <p className="mt-1.5 text-sm text-gray-500">events</p>
          <div className="mt-5 flex h-1.5 overflow-hidden rounded-full bg-gray-100">
            {EVENT_TYPES.map((eventType) => {
              const count = counts[eventType.id] ?? 0;
              if (!count || events.length === 0) return null;
              return (
                <div
                  key={eventType.id}
                  className="h-full"
                  style={{ width: `${(count / events.length) * 100}%`, backgroundColor: eventType.color }}
                />
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {EVENT_TYPES.map((eventType) => (
              <span key={eventType.id} className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: eventType.color }} />
                {eventType.label}
                <span className="font-medium text-gray-700 tabular-nums">{counts[eventType.id] ?? 0}</span>
              </span>
            ))}
          </div>
          {repeatCount > 0 ? (
            <p className="mt-3 text-xs text-gray-400">{repeatCount} repeated deliveries in the stream</p>
          ) : null}
        </motion.section>

        <motion.section
          className="rounded-2xl bg-gradient-to-br from-[#2fbf74] to-[#149455] px-6 py-5 text-white shadow-[0_10px_28px_rgba(20,148,85,0.2)]"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.45, delay: reduce ? 0 : 0.06, ease }}
        >
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-white/80 uppercase">
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-white/60 text-[10px]">i</span>
            Quote views
          </div>
          <p className="mt-4 text-[40px] leading-none font-semibold tracking-tight tabular-nums">{viewCount}</p>
          <p className="mt-3 text-sm text-white/85">opens recorded in the stream</p>
        </motion.section>
      </div>

      <SearchField
        value={query}
        onChange={setQuery}
        label="Search events"
        placeholder="Search by quote, customer, type, or event id"
      />

      <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
        <SectionHeading title="Events" detail={detail} />
        <div className="flex flex-wrap items-center gap-2">
          <Suspense fallback={null}>
            <DateFilter />
          </Suspense>
          <PillSelect
            label="Event type"
            value={type}
            onChange={setType}
            options={[{ value: "all", label: "All types" }, ...EVENT_TYPES.map((eventType) => ({ value: eventType.id, label: eventType.label }))]}
          />
          <PillSelect
            label="Channel"
            value={channel}
            onChange={setChannel}
            options={[
              { value: "all", label: "All channels" },
              { value: "sms", label: "SMS" },
              { value: "email", label: "Email" },
              { value: "none", label: "No channel" },
            ]}
          />
          {filtersActive ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setType("all");
                setChannel("all");
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
          <div className="min-w-[760px]" role="table" aria-label="Events">
            <div className={`${columns} px-5 py-3`} role="row">
              <SortHeader label="When" active={sort.key === "timestamp"} direction={sort.dir} onClick={() => toggleSort("timestamp")} />
              <SortHeader label="Type" active={sort.key === "type"} direction={sort.dir} onClick={() => toggleSort("type")} />
              <SortHeader label="Quote" active={sort.key === "quote_id"} direction={sort.dir} onClick={() => toggleSort("quote_id")} />
              <SortHeader label="Customer" active={sort.key === "customer"} direction={sort.dir} onClick={() => toggleSort("customer")} />
              <SortHeader label="Channel" active={sort.key === "channel"} direction={sort.dir} onClick={() => toggleSort("channel")} />
            </div>
            <motion.div
              key={listKey}
              initial={animateList ? { opacity: 0, y: 4 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0 : 0.22, ease }}
            >
              {filtered.map((event, index) => {
                const day = localDayKey(event.timestamp);
                const previous = filtered[index - 1];
                const showDay = sort.key === "timestamp" && (!previous || localDayKey(previous.timestamp) !== day);
                return (
                  <div key={event.rowKey} className="border-t border-gray-100" role="row">
                    {showDay ? (
                      <div className="px-5 pt-4 text-xs font-medium text-gray-400">{formatDay(event.timestamp)}</div>
                    ) : null}
                    <div className={`${columns} px-5 py-3 hover:bg-[#fafbfc]`}>
                      <div className="text-sm text-gray-700 tabular-nums" role="cell" title={event.timestamp}>
                        {formatTime(event.timestamp)}
                      </div>
                      <div className="flex items-center gap-2" role="cell">
                        <span className={`text-sm font-medium ${eventTypeClass(event.type)}`}>
                          {formatEventType(event.type)}
                        </span>
                        {repeatedIds.has(event.event_id) ? (
                          <span
                            className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-amber-700 uppercase"
                            title="This event id arrived more than once"
                          >
                            Repeat
                          </span>
                        ) : null}
                      </div>
                      <div className="text-sm text-gray-400 tabular-nums" role="cell">
                        {event.quote_id}
                      </div>
                      <div className="min-w-0 truncate text-sm text-[#1c1f26]" role="cell">
                        {event.customer}
                      </div>
                      <div className="text-sm text-gray-500" role="cell" title={event.direction ?? undefined}>
                        {formatChannel(event.channel)}
                        {event.direction ? <span className="mt-0.5 block text-xs text-gray-400">{event.direction}</span> : null}
                      </div>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 ? (
                events.length === 0 && day ? (
                  <DateFilterEmpty noun="events" day={day} />
                ) : (
                  <p className="px-5 py-16 text-center text-sm text-gray-400">Nothing matches these filters.</p>
                )
              ) : null}
            </motion.div>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-400">Newest first. Repeated rows are duplicate webhook deliveries.</p>
    </div>
  );
}
