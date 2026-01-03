"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ConsumerOrderTrackerClient() {
  const { showToast } = useToast();
  const [requestId, setRequestId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const initial = searchParams.get("requestId");
    if (initial) {
      setRequestId(initial);
    }
  }, [searchParams]);

  async function handleLookup(event) {
    event.preventDefault();
    if (!requestId.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(
        `/api/public/orders?id=${encodeURIComponent(requestId.trim())}`
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast({
          title: "Could not find request",
          description: data.error || "Check the ID and try again.",
          variant: "error",
        });
        return;
      }
      setResult(data);
    } catch (error) {
      console.error("Failed to look up consumer order", error);
      showToast({
        title: "Could not look up request",
        description: "Please try again in a moment.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/85 p-5 shadow-2xl shadow-slate-950/80 sm:p-7">
      <h1 className="text-base font-semibold text-slate-50 sm:text-lg">Track a request</h1>
      <p className="mt-1 text-xs text-slate-400 sm:text-sm">
        Paste the request ID you received after submitting your order. We&apos;ll show the latest
        status from the admin dashboard.
      </p>
      <form onSubmit={handleLookup} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Input
          type="text"
          placeholder="e.g. req_1234..."
          value={requestId}
          onChange={(event) => setRequestId(event.target.value)}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={loading}
          className="justify-center bg-linear-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 disabled:opacity-60"
        >
          {loading ? "Looking up..." : "Check status"}
        </Button>
      </form>
      {result && (
        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-200">
          <p className="mb-1 font-medium text-slate-100">Current status</p>
          <p className="mb-2 text-[11px] text-slate-400">Request ID: {result.id}</p>
          <p className="inline-flex rounded-full bg-slate-800/80 px-3 py-1 text-[11px] font-medium text-slate-100">
            {result.status}
          </p>
        </div>
      )}
    </div>
  );
}
