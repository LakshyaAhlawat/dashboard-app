"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import OrderGeneratorHeartbeat from "./OrderGeneratorHeartbeat";
import ChatHeartbeat from "./ChatHeartbeat";

export default function DashboardLayout({ children }) {
  const { status } = useSession();
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <span className="text-xs text-slate-400">Checking session…</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">
      <OrderGeneratorHeartbeat />
      <ChatHeartbeat />
      {/* Desktop sidebar */}
      <div className="hidden lg:block lg:w-64 lg:flex-none">
        <Sidebar />
      </div>

      {/* Mobile sidebar (no full-screen overlay so content stays clickable) */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            className="fixed inset-y-0 left-0 z-50 w-72 max-w-xs"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            <div className="flex h-full flex-col bg-slate-950/95 shadow-2xl shadow-slate-950/80 ring-1 ring-slate-800/80 backdrop-blur-xl">
              <Sidebar onNavigate={() => setIsMobileSidebarOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar onOpenSidebar={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 bg-slate-950 px-4 pb-6 pt-4 md:px-6 md:pb-8 lg:px-8 lg:pt-6">
          <div className="mx-auto flex h-full max-w-6xl flex-col gap-4">
            {/* Simple small-screen navigation as an alternative to the sidebar */}
            <nav className="flex flex-wrap gap-2 text-xs lg:hidden">
              <Link
                href="/dashboard"
                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-100 hover:border-sky-500 hover:text-sky-100"
              >
                Overview
              </Link>
              <Link
                href="/dashboard/orders"
                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-100 hover:border-sky-500 hover:text-sky-100"
              >
                Orders
              </Link>
              <Link
                href="/dashboard/live-orders"
                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-100 hover:border-sky-500 hover:text-sky-100"
              >
                Live orders
              </Link>
              <Link
                href="/dashboard/chat"
                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-100 hover:border-sky-500 hover:text-sky-100"
              >
                Chat
              </Link>
            </nav>
            <div className="flex h-full flex-col gap-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
