"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthProvider, setOauthProvider] = useState(null); // "google" | "github" | null

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Unable to create account.");
        setLoading(false);
        return;
      }

      // Automatically sign in the new user
      await signIn("credentials", {
        redirect: true,
        callbackUrl: "/dashboard",
        email,
        password,
      });
    } catch (err) {
      setError("Something went wrong. Please try again.");
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
          <h1 className="text-lg font-semibold text-slate-50 sm:text-xl">Create your account</h1>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Sign up to access your admin dashboard.
          </p>
        </div>
        <div className="mb-4 space-y-2">
          <Button
            type="button"
            variant="outline"
            disabled={loading || Boolean(oauthProvider)}
            className="flex w-full items-center justify-center gap-2 border-sky-600/70 bg-slate-900/80 text-slate-100 shadow-[0_0_25px_rgba(56,189,248,0.35)] hover:border-sky-400 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={async () => {
              setOauthProvider("google");
              await signIn("google", { callbackUrl: "/dashboard" });
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/google-login.png"
              alt="Google"
              className="h-5 w-5 rounded"
            />
            <span>
              {oauthProvider === "google"
                ? "Signing up with Google..."
                : "Sign up with Google"}
            </span>
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={loading || Boolean(oauthProvider)}
            className="flex w-full items-center justify-center gap-2 border-slate-700 bg-slate-900/80 text-slate-100 hover:border-slate-500 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={async () => {
              setOauthProvider("github");
              await signIn("github", { callbackUrl: "/dashboard" });
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/github-login.png"
              alt="GitHub"
              className="h-5 w-5 rounded"
            />
            <span>
              {oauthProvider === "github"
                ? "Signing up with GitHub..."
                : "Sign up with GitHub"}
            </span>
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-xs font-medium text-red-400">{error}</p>}
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" type="text" placeholder="Jane Doe" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input id="email" name="email" type="email" placeholder="you@company.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" />
          </div>
          <Button
            type="submit"
            disabled={loading || Boolean(oauthProvider)}
            className="mt-2 w-full justify-center bg-linear-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Sign up"}
          </Button>
        </form>
        <p className="mt-4 text-center text-[11px] text-slate-500">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="font-medium text-sky-400 hover:text-sky-300"
          >
            Sign in
          </button>
        </p>
      </div>
    </main>
  );
}
