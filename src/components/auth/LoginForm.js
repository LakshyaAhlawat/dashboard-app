"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const router = useRouter();

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    await signIn("credentials", {
      redirect: true,
      callbackUrl: "/dashboard",
      email,
      password,
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-slate-950/70 backdrop-blur-xl sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-tr from-sky-500 to-indigo-500 text-base font-semibold text-white shadow-lg shadow-sky-500/30">
            AD
          </div>
          <h1 className="text-lg font-semibold text-slate-50 sm:text-xl">Welcome back</h1>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Sign in to access your admin dashboard.
          </p>
        </div>
        <div className="mb-4 space-y-2">
          <Button
            type="button"
            variant="outline"
            className="flex w-full items-center justify-center gap-2 border-sky-600/70 bg-slate-900/80 text-slate-100 shadow-[0_0_25px_rgba(56,189,248,0.35)] hover:border-sky-400 hover:bg-slate-900"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/google-login.png"
              alt="Google"
              className="h-5 w-5 rounded"
            />
            <span>Continue with Google</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex w-full items-center justify-center gap-2 border-slate-700 bg-slate-900/80 text-slate-100 hover:border-slate-500 hover:bg-slate-900"
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/github-login.png"
              alt="GitHub"
              className="h-5 w-5 rounded"
            />
            <span>Continue with GitHub</span>
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error === "CredentialsSignin" && (
            <p className="text-xs font-medium text-red-400">
              Invalid email or password. Please try again.
            </p>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input id="email" name="email" type="email" placeholder="you@company.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" />
          </div>
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-400">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded border border-slate-600 bg-slate-900 text-sky-500 focus:ring-sky-500"
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              className="text-xs font-medium text-sky-400 hover:text-sky-300"
              onClick={() => router.push("/forgot-password")}
            >
              Forgot password?
            </button>
          </div>
          <Button
            type="submit"
            className="mt-2 w-full justify-center bg-linear-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400"
          >
            Sign in
          </Button>
        </form>
        <p className="mt-4 text-center text-[11px] text-slate-500">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="font-medium text-sky-400 hover:text-sky-300"
          >
            Sign up
          </button>
        </p>
      </div>
    </main>
  );
}
