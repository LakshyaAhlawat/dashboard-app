"use client";

import { useSession, signIn, signOut } from "next-auth/react";

function getInitials(nameOrEmail) {
  if (!nameOrEmail) return "?";
  const base = nameOrEmail.split("@")[0];
  const parts = base.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function CustomerUserMenu() {
  const { data, status } = useSession();
  const user = data?.user;

  if (!user || status !== "authenticated") {
    return (
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/consumer/order" })}
        className="rounded-full border border-sky-500/60 bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-sky-200 hover:border-sky-400 hover:text-sky-100"
      >
        Sign in to continue
      </button>
    );
  }

  const { name, email, image } = user;
  const displayName = name || email || "Customer";

  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-2 py-1.5 text-[11px] text-slate-200 shadow-sm shadow-slate-950/70">
      <div className="flex items-center gap-2">
        <div className="relative h-7 w-7 overflow-hidden rounded-full border border-slate-600 bg-slate-800 text-[11px] font-semibold text-slate-100">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              {getInitials(displayName)}
            </div>
          )}
        </div>
        <div className="hidden flex-col leading-tight sm:flex">
          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
            Signed in as
          </span>
          <span className="max-w-36 truncate text-[11px] text-slate-100">
            {displayName}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="ml-1 rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-medium text-slate-100 hover:bg-slate-700"
      >
        Sign out
      </button>
    </div>
  );
}
