"use client";

import Link from "next/link";
export default function HomeActions() {
  return (
    <div className="grid gap-4 text-xs sm:grid-cols-2">
      <div className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 p-4 shadow-[0_0_40px_rgba(15,23,42,1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_70px_rgba(15,23,42,1)]">
        <div className="pointer-events-none absolute -inset-px rounded-3xl bg-linear-to-br from-sky-500/25 via-emerald-400/10 to-indigo-500/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative flex flex-col gap-3">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]" />
            For teams / admins
          </p>
          <p className="text-xs text-slate-300">
            Manage live orders, chat, analytics, and settings from the premium admin dashboard.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-sky-500 to-indigo-500 px-4 py-2 text-slate-50 shadow-[0_0_24px_rgba(56,189,248,0.8)] transition hover:from-sky-400 hover:to-indigo-400"
            >
              Create admin account
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-950/70 px-4 py-2 text-slate-200 transition hover:bg-slate-900"
            >
              Admin log in
            </Link>
          </div>
          <span className="text-[11px] text-slate-500">
            No backend wiring needed — everything is pre-integrated.
          </span>
        </div>
      </div>
      <div className="group relative overflow-hidden rounded-3xl border border-sky-700/40 bg-slate-950/80 p-4 shadow-[0_0_40px_rgba(8,47,73,1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_70px_rgba(8,47,73,1)]">
        <div className="pointer-events-none absolute -inset-px rounded-3xl bg-linear-to-br from-sky-500/25 via-indigo-500/10 to-emerald-400/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative flex flex-col gap-3">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
            For customers
          </p>
          <p className="text-xs text-slate-300">
            Create requests that flow straight into the operations dashboard and track them in your portal.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/consumer/signup"
              className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-sky-500 to-indigo-500 px-4 py-2 text-slate-50 shadow-[0_0_24px_rgba(56,189,248,0.8)] transition hover:from-sky-400 hover:to-indigo-400"
            >
              Customer signup
            </Link>
            <Link
              href="/consumer/login"
              className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-950/70 px-4 py-2 text-slate-200 transition hover:bg-slate-900"
            >
              Customer login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
