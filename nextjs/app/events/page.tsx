import { readEvents } from "@/app/events/action";
import { readQuotes } from "@/app/quotes/action";
import { EventsDashboard } from "@/components/events-dashboard";

export const metadata = { title: "Events" };

export default async function EventsPage() {
  const events = await readEvents();
  const quotes = await readQuotes();
  return <EventsDashboard events={events} quotes={quotes} />;
}
