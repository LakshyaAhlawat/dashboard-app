"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { useToast } from "@/components/ui/ToastProvider";

const STATUS_LABELS = {
  pending_review: "Pending review",
  in_progress: "In progress",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

const STATUS_OPTIONS = [
  { value: "pending_review", label: "Pending review" },
  { value: "in_progress", label: "In progress" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function ConsumerOrdersClient() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [admins, setAdmins] = useState([]);
  const { showToast } = useToast();
  const { data: session } = useSession();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/consumer-orders");
        const data = await res.json();
        if (res.ok) {
          setOrders(data);
        }
      } catch (error) {
        console.error("Failed to load consumer orders", error);
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function loadAdmins() {
      try {
        const res = await fetch("/api/public/admins");
        if (!res.ok) return;
        const data = await res.json();
        setAdmins(data || []);
      } catch (error) {
        console.error("Failed to load admins for reassignment", error);
      }
    }
    loadAdmins();
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter === "all") return true;
      return order.status === statusFilter;
    });
  }, [orders, statusFilter]);

  const metrics = useMemo(() => {
    const total = orders.length;
    let pending = 0;
    let inProgress = 0;
    let approved = 0;
    let rejected = 0;
    let cancelled = 0;
    let potentialRevenue = 0;
    let approvedRevenue = 0;

    for (const order of orders) {
      const value = typeof order.budget === "number" ? order.budget : Number(order.budget || 0) || 0;
      potentialRevenue += value;

      switch (order.status) {
        case "pending_review":
          pending += 1;
          break;
        case "in_progress":
          inProgress += 1;
          break;
        case "approved":
          approved += 1;
          approvedRevenue += value;
          break;
        case "rejected":
          rejected += 1;
          break;
        case "cancelled":
          cancelled += 1;
          break;
        default:
          break;
      }
    }

    const open = pending + inProgress;

    return {
      total,
      pending,
      inProgress,
      approved,
      rejected,
      cancelled,
      open,
      potentialRevenue,
      approvedRevenue,
    };
  }, [orders]);

  const currentAdminId = session?.user?.id || session?.user?.email;

  async function updateStatus(id, status) {
    try {
      const res = await fetch("/api/admin/consumer-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast({
          title: "Could not update",
          description: data.error || "Please try again.",
          variant: "error",
        });
        return;
      }
      setOrders((current) =>
        current.map((order) => (order.id === id ? { ...order, status } : order))
      );
      showToast({
        title: "Status updated",
        description: `Order marked as ${STATUS_LABELS[status] || status}.`,
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to update consumer order", error);
      showToast({
        title: "Could not update",
        description: "Please try again.",
        variant: "error",
      });
    }
  }

  async function reassignOrder(id, adminId) {
    const admin = admins.find((a) => a.id === adminId);
    if (!admin) return;

    try {
      const res = await fetch("/api/admin/consumer-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          reassignmentRequest: true,
          assignedAdminId: admin.id,
          assignedAdminName: admin.name,
          assignedAdminEmail: admin.email,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast({
          title: "Could not reassign",
          description: data.error || "Please try again.",
          variant: "error",
        });
        return;
      }
      showToast({
        title: "Reassignment requested",
        description: `Waiting for ${admin.name} to accept this request.`,
        variant: "default",
      });
      setOrders((current) =>
        current.map((order) =>
          order.id === id
            ? {
                ...order,
                reassignment: data.reassignment || {
                  ...(order.reassignment || {}),
                  toAdminId: admin.id,
                  toAdminName: admin.name,
                  status: "pending",
                },
              }
            : order
        )
      );
    } catch (error) {
      console.error("Failed to reassign consumer order", error);
      showToast({
        title: "Could not reassign",
        description: "Please try again.",
        variant: "error",
      });
    }
  }

  async function editDetails(id, currentDetails) {
    const next = window.prompt("Update request details", currentDetails || "");
    if (next == null) return;
    const trimmed = next.trim();
    if (!trimmed) return;

    try {
      const res = await fetch("/api/admin/consumer-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, details: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast({
          title: "Could not update details",
          description: data.error || "Please try again.",
          variant: "error",
        });
        return;
      }
      setOrders((current) =>
        current.map((order) => (order.id === id ? { ...order, details: trimmed } : order))
      );
      showToast({
        title: "Details updated",
        description: "Request description has been updated.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to edit consumer order details", error);
      showToast({
        title: "Could not update details",
        description: "Please try again.",
        variant: "error",
      });
    }
  }

  async function deleteOrder(id) {
    const confirmed = window.confirm(
      "Delete this request permanently? This cannot be undone."
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/consumer-orders?id=${encodeURIComponent(id)}` , {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast({
          title: "Could not delete",
          description: data.error || "Please try again.",
          variant: "error",
        });
        return;
      }
      setOrders((current) => current.filter((order) => order.id !== id));
      showToast({
        title: "Request deleted",
        description: "The request has been removed from the queue.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to delete consumer order", error);
      showToast({
        title: "Could not delete",
        description: "Please try again.",
        variant: "error",
      });
    }
  }

  async function decideReassignment(id, decision) {
    try {
      const res = await fetch("/api/admin/consumer-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, reassignmentDecision: decision }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast({
          title: "Could not update",
          description: data.error || "Please try again.",
          variant: "error",
        });
        return;
      }
      setOrders((current) =>
        current.map((order) => (order.id === id ? { ...order, ...data } : order))
      );
      showToast({
        title:
          decision === "accept" ? "Request accepted" : "Request declined",
        description:
          decision === "accept"
            ? "You are now responsible for this request."
            : "You declined the transfer; the original admin keeps it.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to decide reassignment", error);
      showToast({
        title: "Could not update",
        description: "Please try again.",
        variant: "error",
      });
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg shadow-slate-950/60 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-50 md:text-lg">
            Consumer orders
          </h1>
          <p className="text-xs text-slate-400 md:text-sm">
            Requests created from the public order form that you can review, fulfill,
            and turn into revenue. Typical flow: Pending review → In progress → Approved.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label
            htmlFor="consumer-status"
            className="text-[11px] font-medium text-slate-400"
          >
            Status
          </label>
          <select
            id="consumer-status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900/80 px-2 py-1 text-xs text-slate-100 outline-none"
          >
            <option value="all">All</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-300">
          <p className="text-[11px] font-medium text-slate-400">Requests pipeline</p>
          <p className="mt-1 text-lg font-semibold text-slate-50">{metrics.total}</p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            {metrics.open} open · {metrics.approved} approved
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-300">
          <p className="text-[11px] font-medium text-slate-400">Workload mix</p>
          <p className="mt-1 text-sm text-slate-200">
            {metrics.pending} pending · {metrics.inProgress} in progress
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            {metrics.rejected} rejected · {metrics.cancelled} cancelled
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-300">
          <p className="text-[11px] font-medium text-slate-400">Potential revenue</p>
          <p className="mt-1 text-lg font-semibold text-emerald-300">
            ${metrics.potentialRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Based on customer budget fields.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-300">
          <p className="text-[11px] font-medium text-slate-400">Approved pipeline value</p>
          <p className="mt-1 text-lg font-semibold text-sky-300">
            ${metrics.approvedRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Sum of budgets on approved requests.
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 shadow-lg shadow-slate-950/60">
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 px-4 py-3 text-xs text-slate-400">
          <p>
            Showing <span className="font-medium text-slate-100">{filtered.length}</span> of
            <span className="font-medium text-slate-100"> {orders.length}</span> requests
          </p>
        </div>
        <Table>
          <THead>
            <TR>
              <TH>Request ID</TH>
              <TH>Name</TH>
              <TH>Email</TH>
              <TH>Details</TH>
              <TH>Assigned admin</TH>
              <TH>Status</TH>
              <TH align="right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {filtered.map((order, index) => (
              <TR key={order.id} tone={index % 2 === 0 ? "default" : "muted"}>
                <TD>{order.id}</TD>
                <TD>{order.name}</TD>
                <TD>{order.email}</TD>
                <TD>
                  <div className="space-y-1 text-[11px] text-slate-200">
                    <p>{order.details}</p>
                    {Array.isArray(order.attachments) && order.attachments.length > 0 && (
                      <div className="mt-1 space-y-1">
                        <p className="text-[10px] font-medium text-slate-400">Attachments</p>
                        <div className="flex flex-wrap gap-1.5">
                          {order.attachments.map((file, idx) => (
                            <a
                              key={file.url || `${file.name}-${idx}`}
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-100 hover:border-sky-500/70 hover:text-sky-100"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                              <span className="max-w-30 truncate">
                                {file.name || "Attachment"}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {order.reassignment && order.reassignment.status === "pending" && (
                      <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[10px] text-amber-100">
                        Pending transfer to {order.reassignment.toAdminName}.
                      </div>
                    )}
                    {order.reassignment && order.reassignment.status === "accepted" && (
                      <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-100">
                        Order transferred to {order.reassignment.toAdminName}.
                      </div>
                    )}
                    {order.reassignment && order.reassignment.status === "declined" && (
                      <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-[10px] text-rose-100">
                        Transfer declined by {order.reassignment.toAdminName}.
                      </div>
                    )}
                  </div>
                </TD>
                <TD>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-300">
                      {order.assignedAdminName || "Unassigned"}
                    </span>
                    {admins.length > 0 && (
                      <select
                        className="rounded-md border border-slate-700 bg-slate-900/80 px-1 py-0.5 text-[10px] text-slate-100 outline-none"
                        defaultValue=""
                        onChange={(event) => {
                          const value = event.target.value;
                          if (value) {
                            reassignOrder(order.id, value);
                            event.target.value = "";
                          }
                        }}
                      >
                        <option value="">Reassign…</option>
                        {admins.map((admin) => (
                          <option key={admin.id} value={admin.id}>
                            {admin.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </TD>
                <TD>
                  <span className="inline-flex rounded-full bg-slate-900/80 px-2 py-0.5 text-[11px] font-medium text-slate-100">
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </TD>
                <TD align="right">
                  {(() => {
                    const reassignment = order.reassignment;
                    const transferredAway =
                      reassignment &&
                      reassignment.status === "accepted" &&
                      reassignment.fromAdminId &&
                      reassignment.fromAdminId === currentAdminId;
                    const canDecide =
                      reassignment &&
                      reassignment.toAdminId &&
                      reassignment.toAdminId === currentAdminId;

                    return (
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="outline"
                      className="border-slate-700 bg-slate-900/80 px-2 py-0.5 text-[11px]"
                      onClick={() => updateStatus(order.id, "approved")}
                      disabled={transferredAway}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="border-slate-700 bg-slate-900/80 px-2 py-0.5 text-[11px]"
                      onClick={() => updateStatus(order.id, "in_progress")}
                      disabled={transferredAway}
                    >
                      In progress
                    </Button>
                    <Button
                      variant="outline"
                      className="border-rose-500/60 bg-rose-500/10 px-2 py-0.5 text-[11px] text-rose-100 hover:bg-rose-500/20"
                      onClick={() => updateStatus(order.id, "rejected")}
                      disabled={transferredAway}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="outline"
                      className="border-amber-500/60 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-100 hover:bg-amber-500/20"
                      onClick={() => updateStatus(order.id, "cancelled")}
                      disabled={transferredAway}
                    >
                      Cancel
                    </Button>
                    {canDecide && (
                      <>
                        <Button
                          variant="outline"
                          className="border-emerald-500/60 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-100 hover:bg-emerald-500/20"
                          onClick={() => decideReassignment(order.id, "accept")}
                          disabled={order.reassignment.status !== "pending"}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          className="border-rose-500/60 bg-rose-500/10 px-2 py-0.5 text-[11px] text-rose-100 hover:bg-rose-500/20"
                          onClick={() => decideReassignment(order.id, "decline")}
                          disabled={order.reassignment.status !== "pending"}
                        >
                          Decline
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      className="border-slate-700 bg-slate-900/80 px-2 py-0.5 text-[11px]"
                      onClick={() => editDetails(order.id, order.details)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="border-slate-800 bg-slate-950/80 px-2 py-0.5 text-[11px] text-slate-400 hover:border-rose-500/60 hover:text-rose-200"
                      onClick={() => deleteOrder(order.id)}
                    >
                      Delete
                    </Button>
                  </div>
                    );
                  })()}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </section>
    </div>
  );
}
