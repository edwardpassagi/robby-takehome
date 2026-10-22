import { Suspense } from "react";
import { readSentFollowUps } from "@/app/quotes/action";
import { DateFilter } from "@/components/date-filter";
import { DateFilterEmpty } from "@/components/date-filter-empty";
import { formatDateTime, formatPhone } from "@/lib/format";
import { isOnDay, selectedDay } from "@/lib/dates";

export const metadata = { title: "Follow-ups" };

export default async function FollowUpsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const day = selectedDay((await searchParams).date);
  const followUps = [...(await readSentFollowUps())]
    .filter((followUp) => !day || isOnDay(followUp.sent_at, day))
    .sort((a, b) => b.sent_at.localeCompare(a.sent_at));

  return (
    <section className="flex flex-col gap-4" aria-labelledby="sent-follow-ups">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <h1 id="sent-follow-ups" className="text-[13px] font-semibold tracking-[0.12em] text-[#1c1f26] uppercase">
            Follow-ups
          </h1>
          <p className="text-sm text-gray-400">
            {followUps.length} sent
          </p>
        </div>
        <Suspense fallback={null}>
          <DateFilter />
        </Suspense>
      </div>
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        {followUps.length === 0 ? (
          day ? (
            <DateFilterEmpty noun="follow-ups" day={day} />
          ) : (
            <p className="px-5 py-16 text-center text-sm text-gray-400">No follow-ups have been sent.</p>
          )
        ) : (
          <ul>
            {followUps.map((followUp) => (
              <li key={followUp.id} className="border-t border-gray-100 px-5 py-4 first:border-t-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-[#1c1f26]">{followUp.customer_name}</p>
                    <p className="mt-0.5 text-xs text-gray-400 tabular-nums">
                      {formatPhone(followUp.customer_phone)} · {followUp.quote_id}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm text-gray-500 tabular-nums">{formatDateTime(followUp.sent_at)}</p>
                </div>
                <p className="mt-2 text-sm text-gray-700">{followUp.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-xs text-gray-400">Times shown in your local timezone.</p>
    </section>
  );
}
