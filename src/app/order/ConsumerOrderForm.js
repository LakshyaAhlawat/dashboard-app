"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function ConsumerOrderForm() {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [admins, setAdmins] = useState([]);
  const [adminId, setAdminId] = useState("");
  const [priority, setPriority] = useState("normal");
  const [category, setCategory] = useState("general");
  const [attachments, setAttachments] = useState([]); // { id, file, name, type, previewUrl, url, status }
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadAdmins() {
      try {
        const res = await fetch("/api/public/admins");
        if (!res.ok) return;
        const data = await res.json();
        setAdmins(data || []);
      } catch (error) {
        console.error("Failed to load admins", error);
      }
    }
    loadAdmins();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setOrderId("");

    if (!name.trim() || !email.trim() || !details.trim()) {
      showToast({
        title: "Missing details",
        description: "Please fill in your name, email, and what you need.",
        variant: "error",
      });
      return;
    }

    if (!adminId) {
      showToast({
        title: "Choose an admin",
        description: "Please select which admin you want to handle this request.",
        variant: "error",
      });
      return;
    }

    // Upload any pending attachments before creating the order
    let finalAttachments = attachments;
    if (attachments.length) {
      setUploadingAttachments(true);
      try {
        const updated = [];
        for (const att of attachments) {
          if (att.url) {
            updated.push(att);
            continue;
          }
          if (!att.file) continue;
          const form = new FormData();
          form.append("file", att.file);
          const uploadRes = await fetch("/api/chat/upload", {
            method: "POST",
            body: form,
          });
          if (!uploadRes.ok) {
            throw new Error("Upload failed");
          }
          const uploadData = await uploadRes.json();
          if (!uploadData?.url) {
            throw new Error("Upload failed");
          }
          updated.push({
            ...att,
            url: uploadData.url,
            status: "uploaded",
          });
        }
        finalAttachments = updated;
        setAttachments(updated);
      } catch (error) {
        console.error("Attachment upload failed", error);
        showToast({
          title: "Could not upload files",
          description: "Please try again or remove the attachments.",
          variant: "error",
        });
        setUploadingAttachments(false);
        return;
      }
      setUploadingAttachments(false);
    }

    setLoading(true);

    try {
      const res = await fetch("/api/public/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          details,
          budget: budget || null,
          adminId,
          adminName: admins.find((a) => a.id === adminId)?.name || null,
          adminEmail: admins.find((a) => a.id === adminId)?.email || null,
          priority,
          category,
          attachments: finalAttachments
            .filter((att) => att.url)
            .map((att) => ({ type: att.type, name: att.name, url: att.url })),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        showToast({
          title: "Could not create order",
          description: data.error || "Please try again in a moment.",
          variant: "error",
        });
      } else {
        const newId = data.order?.id || "";
        setOrderId(newId);
        showToast({
          title: "Request sent",
          description: "We've received your order request. An admin will review it.",
          variant: "success",
        });
        setDetails("");
        setAttachments([]);
      }
    } catch (error) {
      console.error("Consumer order failed", error);
      showToast({
        title: "Could not create order",
        description: "Please try again in a moment.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyId() {
    if (!orderId) return;
    try {
      await navigator.clipboard.writeText(orderId);
      showToast({
        title: "Copied",
        description: "Your request ID is copied to the clipboard.",
        variant: "success",
      });
    } catch (error) {
      console.error("Copy failed", error);
      showToast({
        title: "Could not copy",
        description: "Please select and copy the ID manually.",
        variant: "error",
      });
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-950/85 p-6 shadow-2xl shadow-slate-950/80 backdrop-blur-xl sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-tr from-sky-500 to-indigo-500 text-base font-semibold text-white shadow-lg shadow-sky-500/30">
            AD
          </div>
          <h1 className="text-lg font-semibold text-slate-50 sm:text-xl">Request a new order</h1>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Share what you need and we'll route it straight into the admin dashboard.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Your name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Jane Doe"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="details">What do you want to order?</Label>
            <textarea
              id="details"
              name="details"
              rows={4}
              placeholder="Describe the items, quantity, or any other details…"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/60 placeholder:text-slate-500 focus:border-sky-500 focus:ring-1"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="budget">Approx. budget (optional)</Label>
            <Input
              id="budget"
              name="budget"
              type="number"
              placeholder="e.g. 2500"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                name="priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/60 focus:border-sky-500 focus:ring-1"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/60 focus:border-sky-500 focus:ring-1"
              >
                <option value="general">General request</option>
                <option value="procurement">Procurement</option>
                <option value="logistics">Logistics</option>
                <option value="support">Support</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Reference files (optional)</Label>
            <p className="text-[11px] text-slate-400">
              Attach specs, screenshots, or documents. You can select multiple files.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
              <label className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-dashed border-slate-700 px-3 py-1.5 hover:border-sky-500/60">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                <span>Add files</span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    const files = Array.from(event.target.files || []);
                    if (!files.length) return;
                    setAttachments((current) => {
                      const next = [...current];
                      for (const file of files) {
                        const isImage = file.type.startsWith("image/");
                        const previewUrl = URL.createObjectURL(file);
                        next.push({
                          id: `${Date.now()}-${file.name}-${Math.random().toString(16).slice(2)}`,
                          file,
                          name: file.name,
                          type: isImage ? "image" : "file",
                          previewUrl,
                          url: null,
                          status: "pending",
                        });
                      }
                      return next;
                    });
                    event.target.value = "";
                  }}
                />
              </label>
              {uploadingAttachments && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2 py-1 text-[10px] text-sky-200">
                  <span className="h-3 w-3 animate-spin rounded-full border border-sky-400/70 border-t-transparent" />
                  Uploading files…
                </span>
              )}
            </div>
            {attachments.length > 0 && (
              <div className="mt-2 space-y-1 rounded-2xl border border-slate-800 bg-slate-950/70 p-2 text-[11px] text-slate-200">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between gap-2 rounded-xl bg-slate-900/70 px-2 py-1.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {att.type === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={att.previewUrl}
                          alt={att.name}
                          className="h-7 w-7 rounded object-cover"
                        />
                      ) : (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-[10px] text-slate-200">
                          FILE
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-medium text-slate-100">
                          {att.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {att.url
                            ? "Ready to send"
                            : att.status === "pending"
                            ? "Will upload on submit"
                            : "Uploading…"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAttachments((current) => {
                          current.forEach((item) => {
                            if (item.id === att.id && item.previewUrl?.startsWith("blob:")) {
                              URL.revokeObjectURL(item.previewUrl);
                            }
                          });
                          return current.filter((item) => item.id !== att.id);
                        });
                      }}
                      className="rounded-full bg-slate-800 px-2 py-1 text-[10px] text-slate-200 hover:bg-slate-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <Label htmlFor="admin">Choose your admin</Label>
              {admins.length > 0 && (
                <p className="text-[11px] text-slate-400">
                  Tap a card to select who should handle your request.
                </p>
              )}
            </div>
            {admins.length === 0 ? (
              <p className="text-xs text-slate-500">
                We&apos;re fetching available admins for you, please wait a moment.
              </p>
            ) : (
              <div className="mt-1 grid gap-3 sm:grid-cols-2">
                {admins.map((admin) => {
                  const isSelected = adminId === admin.id;
                  const stats = admin.stats || {};
                  return (
                    <button
                      key={admin.id}
                      type="button"
                      onClick={() => setAdminId(admin.id)}
                      className={`flex w-full flex-col items-start rounded-2xl border px-3 py-3 text-left text-xs transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/80 ${
                        isSelected
                          ? "border-sky-500/70 bg-slate-900/80 shadow-[0_0_24px_rgba(56,189,248,0.45)]"
                          : "border-slate-800 bg-slate-900/50 hover:border-sky-500/40 hover:bg-slate-900/80"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <div>
                          <p className="text-[13px] font-semibold text-slate-50">
                            {admin.name}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {admin.email}
                          </p>
                        </div>
                        <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full border px-2 text-[10px] font-medium ${
                          isSelected
                            ? "border-sky-400 bg-sky-500/10 text-sky-200"
                            : "border-slate-700 bg-slate-900/80 text-slate-300"
                        }`}
                        >
                          {isSelected ? "Chosen" : "Select"}
                        </span>
                      </div>
                      <div className="mt-2 grid w-full gap-2 text-[10px] text-slate-300">
                        <div className="flex w-full gap-3">
                          <div className="flex-1">
                            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                              Total handled
                            </p>
                            <p className="mt-0.5 text-xs font-semibold text-slate-100">
                              {stats.totalOrders ?? 0}
                            </p>
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                              Completed
                            </p>
                            <p className="mt-0.5 text-xs font-semibold text-emerald-300">
                              {stats.completedOrders ?? 0}
                            </p>
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                              In progress
                            </p>
                            <p className="mt-0.5 text-xs font-semibold text-sky-300">
                              {stats.inProgressOrders ?? 0}
                            </p>
                          </div>
                        </div>
                        <div className="flex w-full gap-3">
                          <div className="flex-1">
                            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                              Queued
                            </p>
                            <p className="mt-0.5 text-xs font-semibold text-amber-300">
                              {stats.queuedOrders ?? 0}
                            </p>
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                              At risk
                            </p>
                            <p className="mt-0.5 text-xs font-semibold text-rose-300">
                              {stats.atRiskOrders ?? 0}
                            </p>
                          </div>
                          <div className="flex-1" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <Button
            type="submit"
            disabled={loading || uploadingAttachments}
            className="mt-2 w-full justify-center bg-linear-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 disabled:opacity-60"
          >
            {loading
              ? attachments.length
                ? "Uploading files and sending..."
                : "Sending request..."
              : "Submit order request"}
          </Button>
        </form>
        {orderId && (
          <div className="mt-6 rounded-2xl border border-sky-500/40 bg-slate-900/80 p-4 shadow-[0_0_40px_rgba(56,189,248,0.35)]">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-sky-300">
              Your request ID
            </p>
            <p className="mt-2 break-all font-mono text-sm text-slate-50 sm:text-base">
              {orderId}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Save this ID. You&apos;ll need it to track the status of your request.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyId}
                className="border-sky-500/60 bg-slate-950/60 px-3 py-1.5 text-slate-100 hover:border-sky-400 hover:bg-slate-900"
              >
                Copy ID
              </Button>
              <Button
                type="button"
                onClick={() => router.push(`/consumer/track?requestId=${encodeURIComponent(orderId)}`)}
                className="bg-linear-to-r from-sky-500 to-indigo-500 px-3.5 py-1.5 text-slate-50 hover:from-sky-400 hover:to-indigo-400"
              >
                Go to tracking
              </Button>
            </div>
          </div>
        )}
      </div>
  );
}
