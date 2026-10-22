import { readQuotes } from "@/app/quotes/action";
import { QuotesView } from "@/components/quotes-view";

export const metadata = { title: "Quotes" };

export default async function QuotesPage() {
  const quotes = await readQuotes();
  return <QuotesView quotes={quotes} asOf={new Date().toISOString()} />;
}
