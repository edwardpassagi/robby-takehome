import { readQuotes } from "@/app/quotes/action";
import { QuotesDashboard } from "@/components/quotes-dashboard";

export const metadata = { title: "Quotes" };

export default async function QuotesPage() {
  const quotes = await readQuotes();
  return <QuotesDashboard quotes={quotes} />;
}
