"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Button";

export default function CustomersClient() {
  const [customers, setCustomers] = useState([]);
  const { showToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/customers");
        if (!res.ok) return;
        const data = await res.json();
        setCustomers(data || []);
      } catch (error) {
        console.error("Failed to load customers", error);
      }
    }
    load();
  }, []);

  async function toggleCustomer(id, disabled) {
    try {
      const res = await fetch("/api/admin/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, disabled }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast({
          title: "Could not update customer",
          description: data.error || "Please try again.",
          variant: "error",
        });
        return;
      }
      setCustomers((current) =>
        current.map((customer) =>
          customer.id === id ? { ...customer, disabled } : customer
        )
      );
      showToast({
        title: disabled ? "Customer disabled" : "Customer enabled",
        description: disabled
          ? "This customer can no longer sign in with credentials."
          : "This customer can sign in again.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to update customer", error);
      showToast({
        title: "Could not update customer",
        description: "Please try again.",
        variant: "error",
      });
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg shadow-slate-950/60">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-base font-semibold text-slate-50 md:text-lg">
              Customers
            </h1>
            <p className="text-xs text-slate-400 md:text-sm">
              View all customer accounts and temporarily disable access when needed.
            </p>
          </div>
          <p className="text-[11px] text-slate-400">
            Total customers: <span className="font-medium text-slate-100">{customers.length}</span>
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 shadow-lg shadow-slate-950/60">
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 px-4 py-3 text-xs text-slate-400">
          <p>Manage sign-in access per customer.</p>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-xs md:text-sm">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" align="right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer, index) => {
                const disabled = !!customer.disabled;
                return (
                  <tr
                    key={customer.id}
                    className={
                      index % 2 === 0 ? "bg-slate-950" : "bg-slate-950/70"
                    }
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-slate-200">
                      {customer.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-300">
                      {customer.email}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          disabled
                            ? "bg-rose-500/10 text-rose-300 border border-rose-500/40"
                            : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                        }`}
                      >
                        {disabled ? "Disabled" : "Active"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3" align="right">
                      <Button
                        variant="outline"
                        className="border-slate-700 bg-slate-900/80 px-3 py-1 text-[11px]"
                        onClick={() => toggleCustomer(customer.id, !disabled)}
                      >
                        {disabled ? "Enable" : "Disable"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {!customers.length && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-xs text-slate-400"
                  >
                    No customers yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
