"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { useToast } from "@/components/ui/ToastProvider";

export default function OrdersClient() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/orders");
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Failed to load orders", error);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" ? true : order.status === statusFilter;
      const q = query.trim().toLowerCase();
      const matchesQuery = q
        ? order.id.toLowerCase().includes(q) ||
          order.customer.toLowerCase().includes(q)
        : true;
      return matchesStatus && matchesQuery;
    });
  }, [orders, statusFilter, query]);

  function handleExportCsv() {
    const rows = filtered.length ? filtered : orders;
    if (!rows.length) {
      showToast({
        title: "No orders to export",
        description: "Try adjusting your filters or generating some demo orders.",
        variant: "error",
      });
      return;
    }

    const header = [
      "id",
      "customer",
      "status",
      "channel",
      "valueMinor",
      "currency",
      "etaMinutes",
      "riskLevel",
      "createdAt",
    ];
    const lines = [header.join(",")];

    for (const order of rows) {
      const created = order.createdAt ? new Date(order.createdAt) : null;
      const values = [
        order.id,
        order.customer,
        order.status,
        order.channel,
        String(order.value ?? 0),
        order.currency || "USD",
        order.etaMinutes ?? "",
        order.riskLevel ?? "",
        created ? created.toISOString() : "",
      ];
      lines.push(values.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    }

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "orders-export.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({
      title: "Orders exported",
      description: `Downloaded ${rows.length} row(s) as CSV.`,
      variant: "success",
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg shadow-slate-950/60 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-50 md:text-lg">
            Orders
          </h1>
          <p className="text-xs text-slate-400 md:text-sm">
            Filter and inspect orders. This UI is API-ready.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/70 px-2 py-1">
            <label
              htmlFor="status"
              className="text-[11px] font-medium text-slate-400"
            >
              Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-md border-none bg-slate-950/90 px-1.5 py-0.5 text-xs text-slate-100 outline-none"
            >
              <option value="all">All</option>
              <option value="in_progress">In progress</option>
              <option value="queued">Queued</option>
              <option value="completed">Completed</option>
              <option value="at_risk">At risk</option>
            </select>
          </div>
          <div className="flex flex-1 items-center rounded-lg border border-slate-800 bg-slate-900/70 px-2 py-1.5 text-xs text-slate-300">
            <Input
              type="text"
              placeholder="Search by ID or customer"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="border-0 bg-transparent px-1 py-1 text-xs sm:text-sm"
            />
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 shadow-lg shadow-slate-950/60">
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 px-4 py-3 text-xs text-slate-400">
          <p>
            Showing <span className="font-medium text-slate-100">{filtered.length}</span> of
            <span className="font-medium text-slate-100"> {orders.length}</span> orders
          </p>
          <Button
            variant="outline"
            className="rounded-full border px-3 py-1 text-[11px]"
            onClick={handleExportCsv}
          >
            Export CSV
          </Button>
        </div>
        <div className="w-full overflow-x-auto">
          <Table>
            <THead>
              <TR>
                <TH>Order ID</TH>
                <TH>Customer</TH>
                <TH>Status</TH>
                <TH>Channel</TH>
                <TH>Value</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map((order, index) => (
                <TR key={order.id} tone={index % 2 === 0 ? "default" : "muted"}>
                  <TD>{order.id}</TD>
                  <TD>{order.customer}</TD>
                  <TD>
                    <span className={getStatusClass(order.status)}>
                      {formatStatus(order.status)}
                    </span>
                  </TD>
                  <TD>{order.channel}</TD>
                  <TD>{order.value}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
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

  if (status === "completed") {
    return `${base} bg-emerald-500/10 text-emerald-300`;
  }
  if (status === "at_risk") {
    return `${base} bg-rose-500/10 text-rose-300`;
  }
  if (status === "in_progress") {
    return `${base} bg-sky-500/10 text-sky-300`;
  }
  return `${base} bg-amber-500/10 text-amber-300`;
}
