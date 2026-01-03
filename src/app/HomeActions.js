"use client";

import Link from "next/link";
export default function HomeActions() {
  return (
    <div className="grid gap-3 text-xs sm:grid-cols-2">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg shadow-slate-950/70">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          For teams / admins
        </p>
        <p className="text-xs text-slate-300">
          Manage live orders, chat, analytics, and settings from the premium admin dashboard.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-sky-500 to-indigo-500 px-4 py-2 text-slate-50 shadow-md shadow-sky-500/40 hover:from-sky-400 hover:to-indigo-400"
          >
            Create admin account
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-950/70 px-4 py-2 text-slate-200 hover:bg-slate-900"
          >
            Admin log in
          </Link>
        </div>
        <span className="text-[11px] text-slate-500">
          No backend wiring needed — everything is pre-integrated.
        </span>
      </div>
      <div className="flex flex-col gap-3 rounded-2xl border border-sky-700/40 bg-slate-950/80 p-4 shadow-lg shadow-sky-700/40">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-300">
          For customers
        </p>
        <p className="text-xs text-slate-300">
          Create requests that flow straight into the operations dashboard and track them in your portal.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/consumer/signup"
            className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-sky-500 to-indigo-500 px-4 py-2 text-slate-50 shadow-md shadow-sky-500/40 hover:from-sky-400 hover:to-indigo-400"
          >
            Customer signup
          </Link>
          <Link
            href="/consumer/login"
            className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-950/70 px-4 py-2 text-slate-200 hover:bg-slate-900"
          >
            Customer login
          </Link>
        </div>
      </div>
    </div>
  );
}
