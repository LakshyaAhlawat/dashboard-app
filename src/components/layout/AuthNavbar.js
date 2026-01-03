"use client";

import Link from "next/link";
import HomeLink from "@/components/layout/HomeLink";

export default function AuthNavbar() {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-tr from-sky-500 to-indigo-500 text-[11px] font-semibold text-white shadow-lg shadow-sky-500/40">
            AD
          </div>
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            Admin Control Center
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-xs md:gap-3">
          <HomeLink className="hidden items-center gap-1 rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1.5 text-slate-200 shadow-sm shadow-slate-950/60 hover:bg-slate-900 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            <span>Home</span>
          </HomeLink>
          <Link
            href="/login"
            className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1.5 text-slate-200 shadow-sm shadow-slate-950/60 hover:bg-slate-900"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-linear-to-r from-sky-500 to-indigo-500 px-3.5 py-1.5 text-slate-50 shadow-md shadow-sky-500/40 hover:from-sky-400 hover:to-indigo-400"
          >
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
}
