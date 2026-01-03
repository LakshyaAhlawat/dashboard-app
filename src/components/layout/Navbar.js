"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import HomeLink from "@/components/layout/HomeLink";

export default function Navbar({ onOpenSidebar }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const [profileName, setProfileName] = useState(null);
  const [profileAvatar, setProfileAvatar] = useState(null);

  const userName = profileName || session?.user?.name || "Admin User";
  const avatarUrl = profileAvatar || session?.user?.image || null;
  const userInitials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const displayName =
          data.displayName ||
          [data.firstName, data.lastName].filter(Boolean).join(" ") ||
          session?.user?.name ||
          "Admin User";
        setProfileName(displayName);
        setProfileAvatar(data.avatarDataUrl || null);
      } catch (error) {
        console.error("Failed to load profile for navbar", error);
      }
    }

    fetchProfile();

    function handleProfileUpdated() {
      fetchProfile();
    }

    if (typeof window !== "undefined") {
      window.addEventListener("profile-updated", handleProfileUpdated);
    }

    return () => {
      cancelled = true;
      if (typeof window !== "undefined") {
        window.removeEventListener("profile-updated", handleProfileUpdated);
      }
    };
  }, [session]);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/70 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3 md:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-200 shadow-sm shadow-slate-900/40 hover:bg-slate-800 lg:hidden"
            onClick={onOpenSidebar}
            aria-label="Open sidebar"
          >
            <span className="sr-only">Open navigation</span>
            <span className="flex flex-col gap-1.5">
              <span className="block h-0.5 w-4 rounded-full bg-slate-200" />
              <span className="block h-0.5 w-3 rounded-full bg-slate-400" />
              <span className="block h-0.5 w-5 rounded-full bg-slate-500" />
            </span>
          </button>
          <div className="hidden flex-col lg:flex">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
              Dashboard
            </p>
            <p className="text-sm font-semibold text-slate-100">
              Overview & Operations
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <HomeLink className="hidden items-center gap-1 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-200 shadow-sm shadow-slate-950/60 hover:bg-slate-800 md:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            <span>Home</span>
          </HomeLink>
          <div className="hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-400 shadow-sm shadow-slate-950/60 md:flex">
            <span className="h-5 w-5 rounded-full bg-linear-to-br from-sky-500/70 to-indigo-500/60" />
            <span>Environment: Staging</span>
          </div>
          <DropdownMenu
            align="right"
            trigger={
              <div className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-200 shadow-sm shadow-slate-900/40 hover:bg-slate-800">
                <span className="absolute right-1.5 top-1.5 inline-flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emerald-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-200" />
                </span>
                <BellIcon className="h-4 w-4" />
              </div>
            }
          >
            {(close) => (
              <div className="space-y-1">
                <div className="flex items-center justify-between px-2.5 py-1.5 text-[11px] text-slate-400">
                  <span>Notifications</span>
                  <button
                    type="button"
                    onClick={close}
                    className="text-[10px] text-slate-500 hover:text-slate-300"
                  >
                    Clear
                  </button>
                </div>
                <div className="divide-y divide-slate-800 text-[11px]">
                  <div className="px-2.5 py-2">
                    <p className="font-medium text-slate-100">
                      3 orders close to SLA
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Review in Live Orders.
                    </p>
                  </div>
                  <div className="px-2.5 py-2">
                    <p className="font-medium text-slate-100">
                      New chat waiting
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Customer #1043 joined the queue.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DropdownMenu>
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-1.5 py-1 text-xs text-slate-200 shadow-sm shadow-slate-900/40 hover:bg-slate-800"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
            >
              <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-linear-to-tr from-sky-500 to-indigo-500 text-[11px] font-semibold text-white">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  userInitials
                )}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-[11px] font-medium leading-tight text-slate-100">
                  {userName}
                </p>
                <p className="text-[10px] text-slate-400">Product Admin</p>
              </div>
              <svg
                className="ml-0.5 h-3 w-3 text-slate-500 sm:ml-1"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 8l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="absolute right-0 z-40 mt-2 w-48 max-h-60 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/95 p-1.5 text-xs text-slate-200 shadow-xl shadow-slate-950/80 backdrop-blur-xl"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      router.push("/dashboard/settings#profile");
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left hover:bg-slate-900"
                  >
                    <span>View profile</span>
                    <span className="rounded-full bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">
                      Ctrl+P
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      router.push("/dashboard/settings");
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left hover:bg-slate-900"
                  >
                    <span>Account settings</span>
                    <span className="rounded-full bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">
                      Ctrl+,
                    </span>
                  </button>
                  <div className="my-1 h-px bg-slate-800" />
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[11px] text-rose-300 hover:bg-rose-950/40"
                  >
                    <span>Sign out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

function BellIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M15.5 17.5a3.5 3.5 0 11-7 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M5.75 10.75a6.25 6.25 0 1112.5 0c0 1.658.383 3.054.87 4.024.334.66-.138 1.476-.883 1.476H5.763c-.745 0-1.217-.816-.883-1.476.487-.97.87-2.366.87-4.024z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
