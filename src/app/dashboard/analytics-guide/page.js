export const metadata = {
  title: "Analytics Guide | Admin Dashboard",
};

export default function AnalyticsGuidePage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <section className="rounded-2xl border border-slate-800 bg-linear-to-br from-slate-950 via-slate-950 to-slate-900/80 p-5 shadow-lg shadow-slate-950/60">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
              Playbook
            </p>
            <h1 className="mt-1 text-lg font-semibold text-slate-50 md:text-xl">
              How to read this dashboard like an ops pro
            </h1>
            <p className="mt-1 text-xs text-slate-400 md:text-sm">
              A short, non-technical guide that explains what each metric
              means, how it is calculated, and what to do when it moves.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-300 shadow-lg shadow-slate-950/60">
          <h2 className="text-sm font-semibold text-slate-50">1. Revenue & order mix</h2>
          <p className="text-slate-400">
            <span className="font-semibold text-slate-100">Today&apos;s revenue</span> is
            the sum of all order values created since midnight today. Values
            are stored in cents and converted to currency by dividing by 100.
          </p>
          <ul className="list-disc space-y-1 pl-4 text-[11px] text-slate-400">
            <li>
              Formula: <span className="font-mono">Σ(valueMinor) / 100</span> for
              orders where <span className="font-mono">createdAt</span> is today.
            </li>
            <li>
              Compare <span className="font-mono">Today&apos;s revenue</span> with
              <span className="font-mono">todayOrders</span> to get average order
              size.
            </li>
            <li>
              Use the <span className="font-semibold">status breakdown</span> to see
              how much of that revenue is still in progress vs. already
              completed.
            </li>
          </ul>
        </article>

        <article className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-300 shadow-lg shadow-slate-950/60">
          <h2 className="text-sm font-semibold text-slate-50">2. Flow & bottlenecks</h2>
          <p className="text-slate-400">
            The <span className="font-semibold">Orders over time</span> chart uses
            bars to show how many orders arrive in each hour over the last 12
            hours. Just below it, the <span className="font-semibold">Cumulative
            orders</span> line chart shows how the total builds up over time.
          </p>
          <ul className="list-disc space-y-1 pl-4 text-[11px] text-slate-400">
            <li>
              Spikes in the bars tell you when the system is busiest. If those
              spikes appear while <span className="font-mono">completed</span> stays
              flat, you are building a backlog.
            </li>
            <li>
              A very steep cumulative line means volume is ramping quickly. A
              flatter line means you&apos;re in a quieter window where you can
              safely catch up on <span className="font-mono">in_progress</span> or
              <span className="font-mono">at_risk</span> work.
            </li>
            <li>
              Use <span className="font-mono">avgEtaMinutes</span> as a quick health
              check beside these charts: if the bars spike and the cumulative
              line steepens while ETA drifts up, customers are waiting longer
              than usual.
            </li>
          </ul>
        </article>

        <article className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-300 shadow-lg shadow-slate-950/60">
          <h2 className="text-sm font-semibold text-slate-50">3. Channels & experiments</h2>
          <p className="text-slate-400">
            <span className="font-semibold">Orders by channel</span> tells you where
            customers actually place orders (Web, API, Mobile, etc.).
          </p>
          <ul className="list-disc space-y-1 pl-4 text-[11px] text-slate-400">
            <li>
              Use the raw channel counts to compute your own conversion rates
              from marketing campaigns.
            </li>
            <li>
              Sudden drops for one channel often indicate an integration or
              deployment issue rather than a demand problem.
            </li>
            <li>
              When you run experiments, watch that channel&apos;s share of orders
              over the next few hours.
            </li>
          </ul>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-300 shadow-lg shadow-slate-950/60">
          <h2 className="text-sm font-semibold text-slate-50">Practical checklist</h2>
          <ol className="list-decimal space-y-1 pl-4 text-[11px] text-slate-400">
            <li>Check today&apos;s revenue and compare with yesterday.</li>
            <li>Scan status bars: completed should dominate; at_risk should be low.</li>
            <li>Look at the last 12 hours: are there any unexpected spikes?</li>
            <li>Check channels: does the mix match your expectations?</li>
            <li>Drill into the Orders page for specific outliers.</li>
          </ol>
        </article>

        <article className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-300 shadow-lg shadow-slate-950/60">
          <h2 className="text-sm font-semibold text-slate-50">Teach new teammates</h2>
          <p className="text-slate-400">
            You can treat this page as an onboarding guide. New team members
            learn what each metric means, which numbers should worry them, and
            which levers they can pull (reassign orders, contact customers,
            tweak channels) when things go red.
          </p>
        </article>
      </section>
    </div>
  );
}
