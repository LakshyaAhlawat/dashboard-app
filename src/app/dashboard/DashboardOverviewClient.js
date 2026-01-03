"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

function formatCurrencyFromMinor(valueMinor, currency = "USD") {
  const value = (valueMinor || 0) / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DashboardOverviewClient() {
  const [summary, setSummary] = useState(null);
  const [unseenCustomerChats, setUnseenCustomerChats] = useState(null);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/orders/summary");
        const data = await res.json();
        setSummary(data);
      } catch (error) {
        console.error("Failed to load order summary", error);
      }
    }
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    async function loadUnseenChats() {
      try {
        const res = await fetch("/api/chat/conversations");
        if (!res.ok) return;
        const data = await res.json();
        const conversations = data.conversations || [];
        const currentUserId = session?.user?.id || session?.user?.email;
        if (!currentUserId) {
          setUnseenCustomerChats(0);
          return;
        }
        const count = conversations.filter((conv) => {
          const hasUnread = (conv.unreadBy || []).includes(currentUserId);
          const hasCustomer = (conv.participants || []).some(
            (p) => p.role === "customer"
          );
          return hasUnread && hasCustomer;
        }).length;
        setUnseenCustomerChats(count);
      } catch (error) {
        console.error("Failed to load unseen chats", error);
      }
    }

    loadUnseenChats();
    const id = setInterval(loadUnseenChats, 7000);
    return () => clearInterval(id);
  }, [session]);

  const stats = summary
    ? [
        {
          label: "Today\'s Revenue",
          value: formatCurrencyFromMinor(summary.todayRevenueMinor),
          change: summary?.todayOrders
            ? `${summary.todayOrders} orders • value shown in USD`
            : "Live from MongoDB",
          tone: "positive",
        },
        {
          label: "Active Orders",
          value: String(summary.activeOrders ?? 0),
          change: `${summary.totalOrders ?? 0} total orders`,
          tone: "neutral",
        },
        {
          label: "Avg. ETA",
          value: summary.avgEtaMinutes ? `${summary.avgEtaMinutes.toFixed(1)} min` : "–",
          change: "Across orders with ETA set",
          tone: "neutral",
        },
        {
          label: "At Risk",
          value: String(summary.atRiskCount ?? 0),
          change: "Status: at_risk",
          tone: "negative",
        },
      ]
    : [
        { label: "Today\'s Revenue", value: "…", change: "Loading", tone: "neutral" },
        { label: "Active Orders", value: "…", change: "Loading", tone: "neutral" },
        { label: "Avg. ETA", value: "…", change: "Loading", tone: "neutral" },
        { label: "At Risk", value: "…", change: "Loading", tone: "neutral" },
      ];

  const hourly = summary?.hourlyOrders || [];
  const maxHourly = hourly.length
    ? Math.max(1, ...hourly.map((bucket) => bucket.count || 0))
    : 1;

  // Build cumulative total for the extra line chart
  const cumulative = [];
  if (hourly.length) {
    let running = 0;
    for (const bucket of hourly) {
      running += bucket.count || 0;
      cumulative.push({ label: bucket.label, total: running });
    }
  }
  const maxCumulative = cumulative.length
    ? Math.max(1, ...cumulative.map((bucket) => bucket.total || 0))
    : 1;
  const cumulativeLinePoints = cumulative
    .map((bucket, index) => {
      const x = cumulative.length > 1 ? (index / (cumulative.length - 1)) * 100 : 50;
      const heightRatio = (bucket.total || 0) / maxCumulative;
      const y = 100 - heightRatio * 70 - 5;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Top metric cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-linear-to-br from-slate-950 via-slate-950 to-slate-900/80 p-4 shadow-lg shadow-slate-950/60 transition-transform hover:-translate-y-0.5 hover:border-sky-600/60"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#0ea5e91a,transparent_55%)] opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative flex flex-col gap-3">
              <p className="text-xs font-medium text-slate-400">{stat.label}</p>
              <p className="text-2xl font-semibold tracking-tight text-slate-50">
                {stat.value}
              </p>
              <p
                className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] ${getBadgeTone(
                  stat.tone
                )}`}
              >
                {stat.change}
              </p>
            </div>
          </article>
        ))}
      </section>

      {/* Quick link to the analytics guide */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-300 shadow-lg shadow-slate-950/60">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300 ring-1 ring-emerald-500/40">
              New
            </span>
            <p className="text-[11px] text-slate-300 sm:text-xs">
              Need help reading these numbers? Open the Analytics Guide for a
              step-by-step explanation.
            </p>
          </div>
          <button
            className="inline-flex items-center justify-center rounded-full border border-sky-500/60 bg-slate-900 px-3 py-1 text-[11px] font-medium text-sky-200 hover:border-sky-400 hover:text-sky-100"
            onClick={() => router.push("/dashboard/analytics-guide")}
          >
            Open Analytics Guide
          </button>
        </div>
      </section>

      {/* Unseen customer chats widget */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-300 shadow-lg shadow-slate-950/60">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-50">
              Unseen customer chats
            </h2>
            <p className="mt-1 text-[11px] text-slate-400">
              Customers waiting for a reply in chat.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-semibold tracking-tight text-slate-50">
              {unseenCustomerChats ?? "…"}
            </span>
            <button
              className="inline-flex items-center rounded-full border border-sky-500/60 bg-slate-900 px-3 py-1 text-[11px] font-medium text-sky-200 hover:border-sky-400 hover:text-sky-100"
              onClick={() => router.push("/dashboard/chat")}
            >
              Open chat
            </button>
          </div>
        </div>
      </section>

      {/* Mid row: trend + breakdowns */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="order-2 flex flex-col gap-4 lg:order-1 lg:col-span-3">
          {/* Original bar chart: orders per hour */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg shadow-slate-950/60">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-50">
                  Orders over time (last 12h)
                </h2>
                <p className="text-xs text-slate-400">
                  Each bar shows how many orders landed in that hour.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-slate-900/70 px-2 py-1 text-[10px] text-slate-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>Streaming from live orders</span>
              </div>
            </div>
            <div className="mt-4 h-40 rounded-xl bg-[radial-gradient(circle_at_top,#0ea5e91a,transparent_55%)]">
              <div className="flex h-full items-end justify-between gap-1 px-4 pb-3">
                {hourly.map((bucket, index) => {
                  const height = bucket.count
                    ? (bucket.count / maxHourly) * 100
                    : 4;
                  return (
                    <div
                      key={bucket.label + index}
                      className="flex flex-1 flex-col items-center gap-1"
                    >
                      <div className="flex h-24 w-2 items-end overflow-hidden rounded-full bg-slate-900">
                        <div
                          className="w-full rounded-full bg-linear-to-t from-sky-500 via-sky-400 to-cyan-300"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-slate-500">
                        {bucket.label}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {bucket.count} orders
                      </span>
                    </div>
                  );
                })}
                {!summary && (
                  <div className="flex w-full items-center justify-center text-xs text-slate-400">
                    Loading live trend…
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* New line chart: cumulative orders over last 12h */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg shadow-slate-950/60">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-50">
                  Cumulative orders (last 12h)
                </h2>
                <p className="text-xs text-slate-400">
                  The line shows the running total of orders as the hours pass.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-slate-900/70 px-2 py-1 text-[10px] text-slate-400">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                <span>Good for spotting ramp-up speed</span>
              </div>
            </div>
            <div className="mt-4 h-40 rounded-xl bg-[radial-gradient(circle_at_top,#0ea5e91a,transparent_55%)] px-4 py-3">
              {summary && cumulative.length ? (
                <div className="flex h-full flex-col justify-between">
                  <div className="relative h-28 w-full">
                    <svg
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      className="h-full w-full text-sky-400/80"
                    >
                      <defs>
                        <linearGradient
                          id="cumulative-line-fill"
                          x1="0"
                          x2="0"
                          y1="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {cumulative.length > 1 && (
                        <path
                          d={`M ${cumulativeLinePoints}`}
                          fill="none"
                          stroke="url(#cumulative-line-fill)"
                          strokeWidth="0.8"
                        />
                      )}
                      {cumulative.length > 1 && (
                        <polyline
                          points={cumulativeLinePoints}
                          fill="none"
                          stroke="#22c55e"
                          strokeWidth="0.9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}
                      {cumulative.map((bucket, index) => {
                        const x = cumulative.length > 1 ? (index / (cumulative.length - 1)) * 100 : 50;
                        const heightRatio = (bucket.total || 0) / maxCumulative;
                        const y = 100 - heightRatio * 70 - 5;
                        return (
                          <circle
                            key={bucket.label + index}
                            cx={x}
                            cy={y}
                            r={1.4}
                            fill="#22c55e"
                            className="drop-shadow-[0_0_6px_rgba(34,197,94,0.9)]"
                          />
                        );
                      })}
                    </svg>
                  </div>
                  <div className="mt-2 flex items-end justify-between gap-1 text-[9px] text-slate-400">
                    {cumulative.map((bucket) => (
                      <div key={bucket.label} className="flex flex-1 flex-col items-center gap-0.5">
                        <span className="truncate text-[9px] text-slate-500">
                          {bucket.label}
                        </span>
                        <span className="text-[9px] text-slate-300">
                          {bucket.total} total
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">
                  Waiting for enough data to draw the line…
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2 lg:col-span-2 flex flex-col gap-4">
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg shadow-slate-950/60">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-50">
                Orders by status
              </h2>
              <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-slate-400">
                Helps spot bottlenecks quickly
              </span>
            </div>
            <ul className="mt-3 space-y-2 text-xs text-slate-300">
              {(summary?.statusBreakdown || []).map((item) => {
                const total = summary?.totalOrders || 1;
                const pct = Math.round(((item.count || 0) / total) * 100);
                return (
                  <li key={item.status} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span>{formatStatus(item.status)}</span>
                      <span className="text-[11px] text-slate-400">
                        {item.count} • {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-900">
                      <div
                        className={
                          "h-full rounded-full bg-linear-to-r " +
                          getStatusToneFromCode(item.status)
                        }
                        style={{ width: `${Math.max(pct, 4)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
              {!summary && (
                <li className="text-[11px] text-slate-400">Loading status mix…</li>
              )}
            </ul>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg shadow-slate-950/60">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-50">
                Orders by channel
              </h2>
              <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-slate-400">
                Where customers place orders
              </span>
            </div>
            <ul className="mt-3 space-y-2 text-xs text-slate-300">
              {(summary?.channelBreakdown || []).map((item) => {
                const total = (summary?.channelBreakdown || []).reduce(
                  (acc, current) => acc + (current.count || 0),
                  0
                );
                const pct = Math.round(((item.count || 0) / (total || 1)) * 100);
                return (
                  <li key={item.channel} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span>{item.channel}</span>
                      <span className="text-[11px] text-slate-400">
                        {item.count} • {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-900">
                      <div
                        className="h-full w-1/2 rounded-full bg-linear-to-r from-cyan-400 via-sky-400 to-indigo-400"
                        style={{ width: `${Math.max(pct, 4)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
              {!summary && (
                <li className="text-[11px] text-slate-400">Loading channels…</li>
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* Recent orders table from live data */}
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 shadow-lg shadow-slate-950/60">
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 px-4 py-3 text-xs text-slate-400">
          <div>
            <h2 className="text-sm font-semibold text-slate-50">
              Recent orders
            </h2>
            <p className="text-xs text-slate-400">
              Live sample of the latest orders stored in MongoDB.
            </p>
          </div>
          <button
            className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] text-slate-200 hover:border-sky-500 hover:text-sky-200"
            onClick={() => router.push("/dashboard/orders")}
          >
            View all in Orders
          </button>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-xs md:text-sm">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Order ID</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Channel</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">ETA (min)</th>
              </tr>
            </thead>
            <tbody>
              {(summary?.recentOrders || []).map((order, index) => (
                <tr
                  key={order.id}
                  className={
                    index % 2 === 0 ? "bg-slate-950" : "bg-slate-950/70"
                  }
                >
                  <td className="whitespace-nowrap px-4 py-3 text-slate-200">
                    {order.id}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-300">
                    {order.customer}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-300">
                    {order.channel}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-200">
                    {formatCurrencyFromMinor(order.value, order.currency)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${getStatusToneFromCode(
                        order.status
                      )}`}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-300">
                    {order.etaMinutes ?? "–"}
                  </td>
                </tr>
              ))}
              {!summary && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-xs text-slate-400"
                  >
                    Loading recent orders…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* How these numbers are calculated */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-300 shadow-lg shadow-slate-950/60">
        <h2 className="text-sm font-semibold text-slate-50">
          How we calculate revenue & stats
        </h2>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          <div className="space-y-1 text-[11px]">
            <p className="font-medium text-slate-200">Today&apos;s revenue</p>
            <p className="text-slate-400">
              1. Take all orders where <span className="font-mono">createdAt</span> is
              today (since midnight).
            </p>
            <p className="text-slate-400">
              2. For each of those, use <span className="font-mono">value</span> (stored
              in cents).
            </p>
            <p className="text-slate-400">
              3. Sum all those values and divide by 100 to get dollars.
            </p>
            <p className="text-slate-400">
              Formula: <span className="font-mono">Σ(valueMinor) / 100</span> for
              today&apos;s orders.
            </p>
            {summary && (
              <p className="text-slate-400">
                With {summary.todayOrders} orders today, average order value is
                {" "}
                <span className="font-mono">
                  {formatCurrencyFromMinor(summary.avgOrderValueMinor || 0)}
                </span>
                .
              </p>
            )}
          </div>
          <div className="space-y-1 text-[11px]">
            <p className="font-medium text-slate-200">Active & at-risk orders</p>
            <p className="text-slate-400">
              <span className="font-mono">Active orders</span> counts statuses
              <span className="font-mono"> in_progress</span>,
              <span className="font-mono"> queued</span>, and
              <span className="font-mono"> at_risk</span>.
            </p>
            <p className="text-slate-400">
              <span className="font-mono">At risk</span> is the number of orders with
              status <span className="font-mono">at_risk</span>.
            </p>
          </div>
          <div className="space-y-1 text-[11px]">
            <p className="font-medium text-slate-200">Average ETA</p>
            <p className="text-slate-400">
              We use only orders where <span className="font-mono">etaMinutes</span> is
              set.
            </p>
            <p className="text-slate-400">
              Formula: <span className="font-mono">Σ(etaMinutes) / N</span> where N is
              the number of orders with an ETA.
            </p>
          </div>
        </div>
      </section>

      {/* Raw numbers to validate the charts */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-300 shadow-lg shadow-slate-950/60">
          <h2 className="text-sm font-semibold text-slate-50">
            Raw status numbers
          </h2>
          <p className="mt-1 text-[11px] text-slate-400">
            Use these counts to manually recompute the percentages shown in
            the bars above.
          </p>
          <ul className="mt-3 space-y-1">
            <li className="flex items-center justify-between">
              <span>Total orders</span>
              <span className="font-medium text-slate-100">
                {summary?.totalOrders ?? "…"}
              </span>
            </li>
            {(summary?.statusBreakdown || []).map((item) => (
              <li
                key={item.status}
                className="flex items-center justify-between text-[11px]"
              >
                <span>{formatStatus(item.status)}</span>
                <span className="text-slate-100">{item.count}</span>
              </li>
            ))}
            {!summary && (
              <li className="text-[11px] text-slate-400">Loading…</li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-300 shadow-lg shadow-slate-950/60">
          <h2 className="text-sm font-semibold text-slate-50">
            Raw channel numbers
          </h2>
          <p className="mt-1 text-[11px] text-slate-400">
            Each count is the number of orders that came from that channel.
          </p>
          <ul className="mt-3 space-y-1">
            {(summary?.channelBreakdown || []).map((item) => (
              <li
                key={item.channel}
                className="flex items-center justify-between text-[11px]"
              >
                <span>{item.channel}</span>
                <span className="text-slate-100">{item.count}</span>
              </li>
            ))}
            {!summary && (
              <li className="text-[11px] text-slate-400">Loading…</li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}

function getBadgeTone(tone) {
  if (tone === "positive") {
    return "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/40";
  }
  if (tone === "negative") {
    return "bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/40";
  }
  return "bg-slate-800/60 text-slate-200 ring-1 ring-slate-600/60";
}

function formatStatus(status) {
  if (status === "in_progress") return "In progress";
  if (status === "at_risk") return "At risk";
  if (status === "queued") return "Queued";
  if (status === "completed") return "Completed";
  return status;
}

function getStatusToneFromCode(status) {
  if (status === "completed") {
    return "from-emerald-500 via-emerald-400 to-emerald-300";
  }
  if (status === "at_risk") {
    return "from-rose-500 via-rose-400 to-rose-300";
  }
  if (status === "in_progress") {
    return "from-sky-500 via-sky-400 to-cyan-300";
  }
  return "from-amber-500 via-amber-400 to-yellow-300";
}
