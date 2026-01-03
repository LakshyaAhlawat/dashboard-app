"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState("");
  const [noAccountOverlay, setNoAccountOverlay] = useState(false);
  const { showToast } = useToast();

  async function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setResetUrl("");
    setNoAccountOverlay(false);

    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 404) {
          setNoAccountOverlay(true);
        } else {
          showToast({
            title: "Could not start reset",
            description: data.error || "Please try again in a moment.",
            variant: "error",
          });
        }
      } else {
        if (data.resetUrl) {
          setResetUrl(data.resetUrl);
        }
        showToast({
          title: "Reset link ready",
          description: "We generated a secure reset link for this account.",
          variant: "success",
        });
      }
    } catch (error) {
      console.error("Forgot password failed", error);
      showToast({
        title: "Could not start reset",
        description: "Please try again in a moment.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-slate-950/70 backdrop-blur-xl sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-tr from-sky-500 to-indigo-500 text-base font-semibold text-white shadow-lg shadow-sky-500/30">
            AD
          </div>
          <h1 className="text-lg font-semibold text-slate-50 sm:text-xl">Reset your password</h1>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Enter the email you use to sign in. We&apos;ll send a secure link.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="mt-2 w-full justify-center bg-linear-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 disabled:opacity-60"
          >
            {loading ? "Sending link..." : "Send reset link"}
          </Button>
        </form>
        <p className="mt-4 text-center text-[11px] text-slate-500">
          If an account exists for this email, a secure reset link will be generated.
        </p>

        {resetUrl && (
          <div className="mt-6 rounded-2xl border border-sky-500/40 bg-sky-500/10 p-4 text-xs text-slate-200 shadow-[0_0_35px_rgba(56,189,248,0.4)]">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-sky-300">
              Your reset link
            </p>
            <p className="mb-3 text-[11px] text-slate-300">
              Click the button below to open the secure password reset screen.
            </p>
            <a href={resetUrl} className="inline-flex w-full justify-center">
              <Button className="w-full justify-center bg-linear-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400">
                Open reset page
              </Button>
            </a>
          </div>
        )}
      </div>

      {noAccountOverlay && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl">
        <div className="pointer-events-auto mx-4 w-full max-w-lg rounded-3xl border border-rose-500/40 bg-linear-to-b from-slate-950 via-slate-950/95 to-slate-950/90 p-px shadow-[0_0_80px_rgba(248,113,113,0.5)]">
          <div className="rounded-[1.4rem] bg-slate-950/95 px-6 py-6 sm:px-8 sm:py-7">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-300">
                    No account found
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-50">
                    We couldn&apos;t find an account for this email.
                  </p>
                </div>
              </div>
              <p className="mb-4 text-xs leading-relaxed text-slate-300">
                Double‑check that you typed your work email correctly. If you&apos;re new here, you can
                create an account in a few seconds and start using the dashboard.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="order-2 border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-900 sm:order-1"
                  onClick={() => setNoAccountOverlay(false)}
                >
                  Try another email
                </Button>
                <a href="/signup" className="order-1 sm:order-2">
                  <Button className="w-full justify-center bg-linear-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400">
                    Create account instead
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
