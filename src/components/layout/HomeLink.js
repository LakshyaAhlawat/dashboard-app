"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function HomeLink({ className = "", children }) {
  const { status } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleClick(event) {
    event.preventDefault();
    if (status === "authenticated") {
      setOpen(true);
    } else {
      router.push("/");
    }
  }

  async function handleConfirm() {
    setOpen(false);
    await signOut({ callbackUrl: "/" });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={className}
      >
        {children || "Home"}
      </button>
      {open && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
          <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-950/95 p-6 shadow-xl shadow-slate-950/80">
            <div className="mb-4 flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/15 text-sky-300">
                <span className="text-lg">🏠</span>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-50">
                  Go back to home?
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  If you continue, you will be signed out of your current session and taken to the home page.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-200 hover:bg-slate-800"
              >
                Stay here
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="rounded-full bg-linear-to-r from-sky-500 to-indigo-500 px-3.5 py-1.5 font-medium text-slate-50 shadow-md shadow-sky-500/40 hover:from-sky-400 hover:to-indigo-400"
              >
                Sign out & go home
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
