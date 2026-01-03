import SparklesBackground from "@/components/ui/SparklesBackground";
import CustomerUserMenu from "@/components/layout/CustomerUserMenu";
import HomeLink from "@/components/layout/HomeLink";
import Link from "next/link";

export const metadata = {
  title: "Customer portal | Admin Dashboard",
};

export default function ConsumerLayout({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <SparklesBackground />
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <HomeLink className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-tr from-sky-500 to-indigo-500 text-xs font-semibold text-white shadow-lg shadow-sky-500/40">
                AD
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                  Customer
                </span>
                <span className="text-sm font-semibold text-slate-100">Order portal</span>
              </div>
            </HomeLink>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2 rounded-full border border-sky-500/40 bg-slate-950/80 px-2 py-1 text-[11px] text-slate-200 shadow-[0_0_30px_rgba(56,189,248,0.35)]">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/20 text-[11px] text-sky-200">
                ⚡
              </span>
              <Link
                href="/consumer/order"
                className="rounded-full px-2 py-1 font-medium hover:text-sky-100"
              >
                New request
              </Link>
              <span className="h-3 w-px bg-slate-700" />
              <Link
                href="/consumer/track"
                className="rounded-full px-2 py-1 text-slate-300 hover:text-sky-100"
              >
                Track
              </Link>
              <span className="h-3 w-px bg-slate-700" />
              <Link
                href="/consumer/chat"
                className="rounded-full px-2 py-1 text-slate-300 hover:text-sky-100"
              >
                Chat
              </Link>
            </div>
            <CustomerUserMenu />
          </div>
        </div>
      </header>
      <main className="relative z-10 mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-16 pt-10 md:px-6 lg:px-8 lg:pt-14">
        {children}
      </main>
    </div>
  );
}
