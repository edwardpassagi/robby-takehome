import { readEvents } from "@/app/events/action";
import { readQuotes } from "@/app/quotes/action";
import { EventsDashboard } from "@/components/events-dashboard";
import { isOnDay, selectedDay } from "@/lib/dates";

export const metadata = { title: "Events" };

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const day = selectedDay((await searchParams).date);
  const events = (await readEvents()).filter((event) => !day || isOnDay(event.timestamp, day));
  const quotes = await readQuotes();
  return <EventsDashboard events={events} quotes={quotes} day={day} />;
}
