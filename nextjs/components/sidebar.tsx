"use client";

import { Activity, ClipboardList, MessageSquare } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { isDayKey } from "@/lib/dates";

const items = [
  { href: "/quotes", label: "Quotes", icon: ClipboardList },
  { href: "/follow-ups", label: "Follow-ups", icon: MessageSquare },
  { href: "/events", label: "Events", icon: Activity },
];

export function Sidebar() {
  const pathname = usePathname();
  const search = useSearchParams();
  const reduce = useReducedMotion();
  const date = search.get("date");
  const query = date && isDayKey(date) ? `?date=${date}` : "";

  return (
    <>
      <aside className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-3 md:hidden">
        <Brand query={query} />
        <nav className="flex items-center gap-1">
          {items.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} query={query} reduce={Boolean(reduce)} compact />
          ))}
        </nav>
      </aside>
      <aside className="sticky top-0 hidden h-screen w-[232px] shrink-0 flex-col border-r border-gray-200/90 bg-white px-3 py-6 md:flex">
        <div className="px-2">
          <Brand query={query} />
        </div>
        <nav className="mt-7 flex flex-col gap-1">
          {items.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} query={query} reduce={Boolean(reduce)} />
          ))}
        </nav>
      </aside>
    </>
  );
}

function Brand({ query }: { query: string }) {
  return (
    <Link href={`/quotes${query}`} className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#1b1e27] text-[11px] font-semibold tracking-wide text-white">
        PS
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-[#1c1f26]">Phoenix Services</span>
    </Link>
  );
}

function NavLink({
  item,
  pathname,
  query,
  reduce,
  compact = false,
}: {
  item: (typeof items)[number];
  pathname: string;
  query: string;
  reduce: boolean;
  compact?: boolean;
}) {
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;

  return (
    <Link
      href={`${item.href}${query}`}
      className={`relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${
        active ? "font-medium text-[#1c1f26]" : "text-gray-500 hover:text-[#1c1f26]"
      } ${compact ? "px-2.5" : ""}`}
      aria-current={active ? "page" : undefined}
    >
      {active && !reduce ? (
        <motion.span
          layoutId={compact ? "nav-active-mobile" : "nav-active"}
          className="absolute inset-0 rounded-lg bg-[#f3f4f6]"
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
        />
      ) : null}
      {active && reduce ? <span className="absolute inset-0 rounded-lg bg-[#f3f4f6]" /> : null}
      <Icon className="relative z-10 h-[18px] w-[18px]" strokeWidth={1.75} />
      <span className="relative z-10">{item.label}</span>
    </Link>
  );
}
