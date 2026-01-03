"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UsersClient() {
  const [users, setUsers] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/users");
        if (!res.ok) return;
        const data = await res.json();
        setUsers(data || []);
      } catch (error) {
        console.error("Failed to load users", error);
      }
    }
    load();
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg shadow-slate-950/60">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-base font-semibold text-slate-50 md:text-lg">
              Users
            </h1>
            <p className="text-xs text-slate-400 md:text-sm">
              Manage your admin and operator team.
            </p>
          </div>
          <div className="flex gap-2 text-xs">
            <button
              className="rounded-lg bg-sky-500 px-3 py-1.5 font-medium text-white hover:bg-sky-400"
              onClick={() => router.push("/signup")}
            >
              Invite user
            </button>
            <button
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-200 hover:border-sky-500 hover:text-sky-200"
              onClick={() => router.push("/dashboard/settings")}
            >
              Manage roles
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(users || []).map((user) => {
          const status = user.disabled ? "disabled" : "active";
          const label = user.role || (user.disabled ? "User" : "Admin");
          const lastSeen = user.createdAt
            ? formatJoined(user.createdAt)
            : "Unknown";
          return (
            <article
              key={user.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-md shadow-slate-950/60"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-tr from-sky-500 to-indigo-500 text-xs font-semibold text-white">
                  {getInitials(user.name || user.email)}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-50">
                    {user.name || user.email}
                  </p>
                  <p className="text-xs text-slate-400">{label}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className={getStatusDotClass(status)} />
                  <span className="capitalize">{status}</span>
                </div>
                <p className="text-[11px]">Joined {lastSeen}</p>
              </div>
            </article>
          );
        })}
        {!users && (
          <div className="col-span-full text-[11px] text-slate-400">
            Loading users…
          </div>
        )}
      </section>
    </div>
  );
}

function getInitials(name) {
  if (!name) return "?";
  const base = name.split("@")[0];
  const parts = base.split(/\s+/).filter(Boolean);
  if (!parts.length) return base.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getStatusDotClass(status) {
  const base = "h-2.5 w-2.5 rounded-full";
  if (status === "active") return `${base} bg-emerald-400`;
  if (status === "away") return `${base} bg-amber-400`;
  if (status === "disabled") return `${base} bg-rose-400`;
  return `${base} bg-slate-500`;
}

function formatJoined(dateLike) {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "recently";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
