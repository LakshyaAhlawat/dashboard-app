"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((toast) => {
    const id = crypto.randomUUID();
    const next = {
      id,
      title: toast.title,
      description: toast.description,
      variant: toast.variant || "success",
      duration: toast.duration ?? 3000,
    };
    setToasts((current) => [...current, next]);
  }, []);

  useEffect(() => {
    if (!toasts.length) return;

    const timers = toasts.map((toast) =>
      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== toast.id));
      }, toast.duration)
    );

    return () => {
      timers.forEach((id) => clearTimeout(id));
    };
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-60 flex justify-center px-4 sm:justify-end sm:px-6">
        <div className="flex w-full max-w-sm flex-col gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto overflow-hidden rounded-2xl border px-3 py-2 text-xs shadow-lg shadow-slate-950/70 backdrop-blur ${
                toast.variant === "success"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
                  : toast.variant === "error"
                  ? "border-rose-500/40 bg-rose-500/10 text-rose-100"
                  : "border-slate-700 bg-slate-900/90 text-slate-100"
              }`}
            >
              <p className="font-medium">
                {toast.title}
              </p>
              {toast.description && (
                <p className="mt-0.5 text-[11px] opacity-90">
                  {toast.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
