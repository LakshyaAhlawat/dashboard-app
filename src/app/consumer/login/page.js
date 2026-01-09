"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function ConsumerLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [oauthProvider, setOauthProvider] = useState(null); // "google" | "github" | null

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    await signIn("credentials", {
      redirect: true,
      callbackUrl: "/consumer",
      email,
      password,
    });
  }

  return (
    <div className="mx-auto mt-4 w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/85 p-6 shadow-xl shadow-slate-950/70 backdrop-blur-xl sm:mt-6 sm:p-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <h1 className="text-lg font-semibold text-slate-50 sm:text-xl">Customer login</h1>
        <p className="mt-1 text-xs text-slate-400 sm:text-sm">
          Sign in to view and track your requests.
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
            await signIn("google", { callbackUrl: "/consumer" });
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/google-login.png"
            alt="Google"
            className="h-5 w-5 rounded"
          />
          <span>
            {oauthProvider === "google" ? "Signing in with Google..." : "Continue with Google"}
          </span>
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={loading || Boolean(oauthProvider)}
          className="flex w-full items-center justify-center gap-2 border-slate-700 bg-slate-900/80 text-slate-100 hover:border-slate-500 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={async () => {
            setOauthProvider("github");
            await signIn("github", { callbackUrl: "/consumer" });
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/github-login.png"
            alt="GitHub"
            className="h-5 w-5 rounded"
          />
          <span>
            {oauthProvider === "github" ? "Signing in with GitHub..." : "Continue with GitHub"}
          </span>
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" placeholder="••••••••" />
        </div>
        <Button
          type="submit"
          disabled={loading || Boolean(oauthProvider)}
          className="mt-2 w-full justify-center bg-linear-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <p className="mt-4 text-center text-[11px] text-slate-500">
        New here?{" "}
        <button
          type="button"
          onClick={() => router.push("/consumer/signup")}
          className="font-medium text-sky-400 hover:text-sky-300"
        >
          Create a customer account
        </button>
      </p>
    </div>
  );
}
