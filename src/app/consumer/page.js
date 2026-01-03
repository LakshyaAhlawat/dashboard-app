import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Customer portal | Admin Dashboard",
};

export default async function ConsumerHomePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/consumer/login");
  }

  const customerId = session.user.id || session.user.email;
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "dashboard");
  const recentOrders = await db
    .collection("consumer_orders")
    .find({ $or: [{ customerId }, { customerId: { $exists: false } }] })
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();

  return (
    <section className="space-y-8">
      <div className="max-w-xl space-y-4">
        <p className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/15 px-3 py-1 text-[11px] font-medium text-sky-100 shadow-[0_0_30px_rgba(56,189,248,0.4)] backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Direct line into the operations team
        </p>
        <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-slate-50 sm:text-4xl">
          Send requests straight into our
          <span className="bg-linear-to-r from-sky-400 via-indigo-300 to-emerald-300 bg-clip-text text-transparent">
            {" "}
            admin dashboard.
          </span>
        </h1>
        <p className="text-sm text-slate-300 sm:text-base">
          Create a new order request in a few seconds and securely track the status as the
          operations team reviews, approves, or fulfills it.
        </p>
        <div className="flex flex-wrap gap-3 text-xs">
          <Link
            href="/consumer/order"
            className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-sky-500 to-indigo-500 px-4 py-2 text-slate-50 shadow-md shadow-sky-500/40 hover:from-sky-400 hover:to-indigo-400"
          >
            Create order request
          </Link>
          <Link
            href="/consumer/track"
            className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-950/70 px-4 py-2 text-slate-200 shadow-sm shadow-slate-950/70 hover:bg-slate-900"
          >
            Track existing request
          </Link>
        </div>
      </div>
      {recentOrders.length > 0 && (
        <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/85 p-4 text-xs text-slate-200 shadow-xl shadow-slate-950/70 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Your recent requests
              </p>
              <p className="text-xs text-slate-400">
                Up to 5 most recent submissions tied to your account.
              </p>
            </div>
            <Link
              href="/consumer/track"
              className="hidden rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-slate-200 hover:bg-slate-800 sm:inline-flex"
            >
              Track by ID
            </Link>
          </div>
          <div className="space-y-2">
            {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-medium text-slate-200">{order.details}</p>
                    <p className="text-[10px] text-slate-500 break-all">
                      ID: {order.id}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full bg-slate-800/90 px-2.5 py-0.5 text-[10px] font-medium text-slate-100">
                      {order.status || "pending_review"}
                    </span>
                    <Link
                      href={`/consumer/track?requestId=${encodeURIComponent(order.id)}`}
                      className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-sky-500 to-indigo-500 px-2.5 py-1 text-[10px] font-medium text-slate-50 hover:from-sky-400 hover:to-indigo-400"
                    >
                      View status
                    </Link>
                  </div>
                </div>
              ))}
            </div>
        </div>
      )}
    </section>
  );
}
