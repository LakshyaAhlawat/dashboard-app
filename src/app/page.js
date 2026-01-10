import Link from "next/link";
import SparklesBackground from "@/components/ui/SparklesBackground";
import HomeActions from "./HomeActions";
import FeatureCarousel from "./FeatureCarousel";

export const metadata = {
  title: "Admin Control Center",
};

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <SparklesBackground />

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
              <span className="text-[11px] text-slate-400">
                Live admin dashboard + customer portal for operations teams
              </span>
            </div>
          </div>
          <nav className="hidden items-center gap-2 text-[11px] md:flex">
            <Link
              href="/consumer"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 font-medium text-slate-100 hover:border-sky-500 hover:text-sky-100"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Customer portal</span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-sky-500 to-indigo-500 px-3 py-1 text-[11px] font-semibold text-white shadow-md shadow-sky-500/40 hover:from-sky-400 hover:to-indigo-400"
            >
              <span>Admin login</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative mx-auto flex min-h-[calc(100vh-56px)] max-w-6xl flex-col justify-center px-4 pb-16 pt-10 sm:pt-12 md:flex-row md:items-center md:gap-10 md:px-6 lg:px-8">
        <section className="max-w-2xl space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/15 px-3 py-1 text-[11px] font-medium text-sky-100 shadow-[0_0_40px_rgba(56,189,248,0.55)] backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Shared inbox for orders & customer requests
          </p>
          <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-slate-50 sm:text-4xl lg:text-[3.2rem]">
            One place to see every order, customer request, and chat
            <span className="bg-linear-to-r from-sky-400 via-indigo-300 to-emerald-300 bg-clip-text text-transparent">
              {" "}
              across your team.
            </span>
          </h1>
          <p className="max-w-xl text-sm text-slate-300 sm:text-base">
            This is an internal admin dashboard and customer portal. Your team reviews and fulfills
            incoming requests in one live queue, while customers use a simple portal to place orders,
            upload documents, and track their status in real time.
          </p>
          <div className="mt-3 space-y-1 text-[11px] text-slate-300 sm:text-xs">
            <p className="font-medium text-slate-200">Who is this for?</p>
            <div className="grid gap-2 sm:grid-cols-3">
              <div>
                <p className="font-medium text-slate-100">Operations teams</p>
                <p className="text-slate-400">Manage incoming work in one queue.</p>
              </div>
              <div>
                <p className="font-medium text-slate-100">Support & CX</p>
                <p className="text-slate-400">See every customer message and file.</p>
              </div>
              <div>
                <p className="font-medium text-slate-100">Founders & owners</p>
                <p className="text-slate-400">Track revenue and SLAs in real time.</p>
              </div>
            </div>
          </div>
          <HomeActions />
          <div className="mt-5 grid gap-4 text-[11px] text-slate-300 sm:grid-cols-3">
            <div className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80 p-3 shadow-[0_0_30px_rgba(15,23,42,1)] transition-all duration-300 hover:-translate-y-1 hover:border-sky-500/80 hover:shadow-[0_0_50px_rgba(56,189,248,0.8)]">
              <div className="pointer-events-none absolute inset-px rounded-2xl bg-linear-to-br from-sky-500/20 via-transparent to-emerald-400/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <p className="inline-flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]" />
                  Live requests
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-50">Centralized queue</p>
                <p className="mt-0.5 text-[11px] text-slate-400">Prioritize, assign, and track SLAs.</p>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80 p-3 shadow-[0_0_30px_rgba(15,23,42,1)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/80 hover:shadow-[0_0_50px_rgba(16,185,129,0.8)]">
              <div className="pointer-events-none absolute inset-px rounded-2xl bg-linear-to-br from-emerald-400/20 via-transparent to-sky-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <p className="inline-flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
                  Customer portal
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-50">Self-service</p>
                <p className="mt-0.5 text-[11px] text-slate-400">Customers place orders & upload docs.</p>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80 p-3 shadow-[0_0_30px_rgba(15,23,42,1)] transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/80 hover:shadow-[0_0_50px_rgba(129,140,248,0.8)]">
              <div className="pointer-events-none absolute inset-px rounded-2xl bg-linear-to-br from-indigo-400/20 via-transparent to-sky-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <p className="inline-flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.9)]" />
                  Chat + files
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-50">Real-time context</p>
                <p className="mt-0.5 text-[11px] text-slate-400">Keep every conversation in the thread.</p>
              </div>
            </div>
          </div>
        </section>
        <aside className="mt-10 flex w-full max-w-md justify-center md:mt-0 md:w-auto">
          <FeatureCarousel />
        </aside>
      </main>
    </div>
  );
}
