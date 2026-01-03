"use client";

import { useEffect, useState } from "react";

function formatCurrencyMinor(value, currency) {
  const amount = (value ?? 0) / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function LiveOrdersClient() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadInitial() {
      try {
        const response = await fetch("/api/orders");
        const data = await response.json();
        if (isMounted) {
          setOrders(data.slice(0, 20));
        }
      } catch (error) {
        console.error("Failed to load live orders", error);
      }
    }

    async function tick() {
      try {
        const response = await fetch("/api/orders");
        const data = await response.json();
        if (isMounted) {
          setOrders(data.slice(0, 20));
        }
      } catch (error) {
        console.error("Failed to refresh live orders", error);
      }
    }

    loadInitial();
    const id = setInterval(tick, 8000);

    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg shadow-slate-950/60">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-base font-semibold text-slate-50 md:text-lg">
              Live orders
            </h1>
            <p className="text-xs text-slate-400 md:text-sm">
              New orders are simulated in the background and this feed
              refreshes to show the latest ones.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Streaming via API (WebSocket-ready)
            </span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 shadow-lg shadow-slate-950/60">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 text-xs text-slate-400">
              <p>
                This feed currently simulates incoming orders. Replace the
                generator endpoint with your real-time backend when ready.
              </p>
              <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px]">
                Refresh: 8s
              </span>
            </div>
            <div className="divide-y divide-slate-800">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="flex items-center justify-between px-4 py-3 text-xs text-slate-200"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-50">
                      {order.id}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {order.customer}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={getStatusClass(order.status)}>
                      {formatStatus(order.status)}
                    </span>
                    <span className="font-mono text-xs text-slate-100">
                      {order.etaMinutes ? `${order.etaMinutes} min` : "--"}
                    </span>
                    <span className="hidden text-[11px] text-slate-300 sm:inline">
                      {formatCurrencyMinor(order.value, order.currency)}
                    </span>
                  </div>
                </article>
              ))}
              {orders.length === 0 && (
                <div className="px-4 py-6 text-center text-xs text-slate-500">
                  Waiting for first generated order…
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-300 shadow-lg shadow-slate-950/60">
            <h2 className="text-sm font-semibold text-slate-50">
              Integration notes
            </h2>
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-[11px] text-slate-400">
              <li>Replace the /api/orders/generate endpoint with your feed.</li>
              <li>Connect via WebSocket and push into this component.</li>
              <li>Keep a rolling window of the most recent N orders.</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}

function formatStatus(status) {
  if (status === "in_progress") return "In progress";
  if (status === "at_risk") return "At risk";
  if (status === "queued") return "Queued";
  if (status === "completed") return "Completed";
  return status;
}

function getStatusClass(status) {
  const base =
    "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium";
  if (status === "in_progress")
    return `${base} bg-sky-500/10 text-sky-300`;
  if (status === "at_risk") return `${base} bg-rose-500/10 text-rose-300`;
  if (status === "queued") return `${base} bg-amber-500/10 text-amber-300`;
  if (status === "completed")
    return `${base} bg-emerald-500/10 text-emerald-300`;
  return `${base} bg-slate-800/80 text-slate-200`;
}
