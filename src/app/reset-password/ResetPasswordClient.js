"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function ResetPasswordClient({ token: initialToken }) {
  const router = useRouter();
  const { showToast } = useToast();
  const token = initialToken || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!token) {
      showToast({
        title: "Invalid link",
        description: "This reset link is missing or expired.",
        variant: "error",
      });
      return;
    }

    if (!password || password !== confirm) {
      showToast({
        title: "Passwords don&apos;t match",
        description: "Please enter the same password twice.",
        variant: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        showToast({
          title: "Could not reset password",
          description: data.error || "Please request a new link.",
          variant: "error",
        });
      } else {
        showToast({
          title: "Password updated",
          description: "You can now sign in with your new password.",
          variant: "success",
        });
        router.push("/login");
      }
    } catch (error) {
      console.error("Reset password failed", error);
      showToast({
        title: "Could not reset password",
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
          <h1 className="text-lg font-semibold text-slate-50 sm:text-xl">Choose a new password</h1>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Use your secure reset link to pick a brand new password.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              name="confirm"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="mt-2 w-full justify-center bg-linear-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 disabled:opacity-60"
          >
            {loading ? "Updating password..." : "Update password"}
          </Button>
        </form>
      </div>
    </main>
  );
}
