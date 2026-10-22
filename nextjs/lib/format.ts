const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function localParts(iso: string) {
  const date = new Date(iso);
  const hours24 = date.getHours();
  return {
    month: MONTHS[date.getMonth()],
    day: date.getDate(),
    year: date.getFullYear(),
    hours: hours24 % 12 || 12,
    minutes: String(date.getMinutes()).padStart(2, "0"),
    suffix: hours24 >= 12 ? "PM" : "AM",
  };
}

export const EVENT_TYPES = [
  { id: "quote_sent", label: "Quote sent", color: "#94a3b8", text: "text-slate-500" },
  { id: "quote_viewed", label: "Quote viewed", color: "#0ea5e9", text: "text-sky-600" },
  { id: "customer_replied", label: "Customer replied", color: "#10b981", text: "text-emerald-600" },
  { id: "message_sent", label: "Message sent", color: "#8b5cf6", text: "text-violet-600" },
  { id: "quote_accepted", label: "Quote accepted", color: "#047857", text: "text-emerald-700" },
] as const;

const eventLabels: Record<string, string> = Object.fromEntries(
  EVENT_TYPES.map((type) => [type.id, type.label]),
);
const eventText: Record<string, string> = Object.fromEntries(
  EVENT_TYPES.map((type) => [type.id, type.text]),
);

export function formatMoney(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const parts = localParts(iso);
  return `${parts.month} ${parts.day}, ${parts.hours}:${parts.minutes} ${parts.suffix}`;
}

export function formatDay(iso: string): string {
  const parts = localParts(iso);
  return `${parts.month} ${parts.day}`;
}

export function formatTime(iso: string): string {
  const parts = localParts(iso);
  return `${parts.hours}:${parts.minutes} ${parts.suffix}`;
}

export function formatLongDate(iso: string): string {
  const parts = localParts(iso);
  return `${parts.month} ${parts.day}, ${parts.year}`;
}

export function formatDayKey(day: string): string {
  const [year, month, date] = day.split("-").map(Number);
  return `${MONTHS[month - 1] ?? ""} ${date}, ${year}`;
}

export function formatEventType(type: string): string {
  return eventLabels[type] ?? type.replaceAll("_", " ");
}

export function eventTypeClass(type: string): string {
  return eventText[type] ?? "text-gray-600";
}

export function formatChannel(channel?: string): string {
  if (!channel) return "—";
  if (channel === "sms") return "SMS";
  if (channel === "email") return "Email";
  return channel;
}

export function formatStatus(status: string): string {
  if (!status) return "—";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function statusClass(status: string): string {
  if (status === "open") return "text-[#e07a32]";
  if (status === "accepted") return "text-emerald-600";
  if (status === "dismissed") return "text-gray-400";
  return "text-gray-600";
}
