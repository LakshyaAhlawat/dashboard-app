"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/consumer-orders", label: "Consumer orders" },
  { href: "/dashboard/users", label: "Users" },
  { href: "/dashboard/live-orders", label: "Live Orders" },
  { href: "/dashboard/chat", label: "Chat" },
  { href: "/dashboard/analytics-guide", label: "Analytics Guide" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function Sidebar({ onNavigate }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-800 bg-slate-950/80 px-4 py-6 backdrop-blur-xl">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-tr from-sky-500 to-indigo-500 text-sm font-semibold text-white shadow-lg shadow-sky-500/30">
          AD
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-50">Admin Dashboard</p>
          <p className="text-xs text-slate-400">Control center</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="relative block"
            >
              <div
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "text-sky-50"
                    : "text-slate-400 hover:text-slate-100"
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                )}
              </div>
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="pointer-events-none absolute inset-0 -z-10 rounded-lg bg-slate-900/80 ring-1 ring-sky-500/40"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 rounded-lg border border-dashed border-slate-700 bg-slate-900/40 p-3 text-xs text-slate-400">
        <p className="font-medium text-slate-200">Live features</p>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
          Live orders, chat, and notifications are WebSocket-ready and can be
          wired to your real-time backend later.
        </p>
      </div>
    </aside>
  );
}
