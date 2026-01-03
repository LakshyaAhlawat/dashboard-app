import Link from "next/link";
import SparklesBackground from "@/components/ui/SparklesBackground";
import HomeActions from "./HomeActions";

export const metadata = {
  title: "Admin Control Center",
};

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <SparklesBackground />

      {/* Floating 3D dashboard title that orbits subtly in depth */}
      <div className="pointer-events-none absolute inset-x-0 top-16 flex justify-center sm:top-20 md:top-24">
        <div className="orbit-title-3d-wrapper">
          <div className="orbit-title-3d bg-linear-to-r from-sky-400 via-indigo-300 to-emerald-300 bg-clip-text text-[9px] font-semibold tracking-[0.55em] text-transparent opacity-90 drop-shadow-[0_0_22px_rgba(56,189,248,0.9)] sm:text-[11px]">
            PREMIUM DASHBOARD
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-tr from-sky-500 to-indigo-500 text-xs font-semibold text-white shadow-lg shadow-sky-500/40">
              AD
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                Admin
              </span>
              <span className="text-sm font-semibold text-slate-100">
                Control Center
              </span>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-[11px] text-slate-300 md:flex">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 shadow-sm shadow-sky-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="font-medium tracking-[0.12em] text-sky-100">
                LIVE TEMPLATE
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 shadow-sm shadow-slate-950/50">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              <span className="tracking-[0.08em] text-slate-300">
                Next.js · MongoDB · Google OAuth
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-16 pt-14 sm:pt-16 md:px-6 md:pt-20 lg:px-8 lg:pt-24">
        <section className="grid gap-10 md:grid-cols-1 lg:grid-cols-[minmax(0,3.1fr)_minmax(0,2.4fr)] lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/15 px-3 py-1 text-[11px] font-medium text-sky-100 shadow-[0_0_40px_rgba(56,189,248,0.45)] backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live-ready admin dashboard template
            </p>
            <h1 className="text-balance text-2xl font-semibold leading-tight tracking-tight text-slate-50 sm:text-3xl lg:text-[3.1rem]">
              Run operations, orders, and support from a single
              <span className="bg-linear-to-r from-sky-400 via-indigo-300 to-emerald-300 bg-clip-text text-transparent">
                {" "}
                premium UI.
              </span>
            </h1>
            <p className="max-w-xl text-sm text-slate-300 sm:text-base">
              Get a production-ready dashboard with live orders, chat, users, and settings — wired to
              MongoDB, Google OAuth, and responsive from mobile to desktop.
            </p>
            <HomeActions />

            <div className="grid gap-3 pt-2 text-[11px] text-slate-300 sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-[11px] text-emerald-300">
                  ●
                </span>
                <div className="space-y-0.5">
                  <p className="font-medium text-slate-100">Admins</p>
                  <p className="text-[11px] text-slate-400">Track live orders, manage teams, and reply to chats.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/15 text-[11px] text-sky-300">
                  ⚡
                </span>
                <div className="space-y-0.5">
                  <p className="font-medium text-slate-100">Customers</p>
                  <p className="text-[11px] text-slate-400">Place requests, track status, and chat with your team.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-slate-700/70 bg-slate-950/80 p-4 shadow-[0_0_90px_rgba(15,23,42,1)] ring-1 ring-slate-800/80">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.28),transparent_55%),radial-gradient(circle_at_bottom,rgba(129,140,248,0.3),transparent_55%)] opacity-80" />
            <div className="relative space-y-3 text-xs">
              <div className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-950/90 px-3 py-2">
                <div>
                  <p className="text-[11px] text-slate-400">Live orders</p>
                  <p className="text-sm font-semibold text-slate-50">Streaming in real time</p>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-medium text-emerald-300">
                  Connected
                </span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/90 p-3">
                  <p className="text-[11px] text-slate-400">Today&apos;s volume</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-50">$42.3k</p>
                  <p className="mt-1 text-[11px] text-emerald-300">+18.2% vs yesterday</p>
                </div>
                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/90 p-3">
                  <p className="text-[11px] text-slate-400">Avg. SLA</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-50">3.8 min</p>
                  <p className="mt-1 text-[11px] text-slate-400">Across all channels</p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/90 p-3">
                <p className="mb-2 text-[11px] text-slate-400">What you get</p>
                <ul className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-300">
                  <li className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-400" /> Live orders view
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> MongoDB backend
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" /> Google sign-in
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Responsive layout
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
