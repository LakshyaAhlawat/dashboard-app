"use client";

import { useEffect, useState } from "react";

const CARDS = [
  {
    id: "live-orders",
    headerLabel: "Live orders",
    headerTitle: "Streaming in real time",
    statusLabel: "Connected",
    statusTone: "bg-emerald-500/90 text-emerald-50 shadow-[0_0_18px_rgba(16,185,129,0.9)]",
    metricLeft: {
      title: "Today's volume",
      value: "$42.3k",
      helper: "+18.2% vs yesterday",
      helperTone: "text-emerald-300",
    },
    metricRight: {
      title: "Avg. SLA",
      value: "3.8 min",
      helper: "Across all channels",
    },
    bullets: [
      { color: "bg-sky-400", label: "Live orders view" },
      { color: "bg-emerald-400", label: "MongoDB backend" },
      { color: "bg-indigo-400", label: "Google sign-in" },
      { color: "bg-amber-400", label: "Responsive layout" },
    ],
  },
  {
    id: "customer-health",
    headerLabel: "Customer health",
    headerTitle: "Satisfaction in one glance",
    statusLabel: "Stable",
    statusTone: "bg-sky-500/90 text-sky-50 shadow-[0_0_18px_rgba(56,189,248,0.9)]",
    metricLeft: {
      title: "CSAT score",
      value: "4.7 / 5",
      helper: "+0.4 vs last week",
      helperTone: "text-emerald-300",
    },
    metricRight: {
      title: "NPS",
      value: "62",
      helper: "Promoters minus detractors",
    },
    bullets: [
      { color: "bg-emerald-400", label: "Feedback in chat" },
      { color: "bg-sky-400", label: "Auto follow-ups" },
      { color: "bg-indigo-400", label: "SLA alerts" },
      { color: "bg-fuchsia-400", label: "Customer segments" },
    ],
  },
  {
    id: "ops-efficiency",
    headerLabel: "Ops efficiency",
    headerTitle: "Teams in perfect sync",
    statusLabel: "Optimized",
    statusTone: "bg-indigo-500/90 text-indigo-50 shadow-[0_0_18px_rgba(129,140,248,0.9)]",
    metricLeft: {
      title: "Time saved",
      value: "48%",
      helper: "vs manual workflows",
      helperTone: "text-emerald-300",
    },
    metricRight: {
      title: "Automations",
      value: "32 rules",
      helper: "Routing, tags, escalations",
    },
    bullets: [
      { color: "bg-sky-400", label: "Smart routing" },
      { color: "bg-emerald-400", label: "Bulk actions" },
      { color: "bg-indigo-400", label: "Role-based access" },
      { color: "bg-amber-400", label: "Change history" },
    ],
  },
  {
    id: "security",
    headerLabel: "Security",
    headerTitle: "Enterprise-ready by default",
    statusLabel: "Hardened",
    statusTone: "bg-fuchsia-500/90 text-fuchsia-50 shadow-[0_0_18px_rgba(217,70,239,0.9)]",
    metricLeft: {
      title: "SSO coverage",
      value: "100%",
      helper: "Google & GitHub sign-in",
      helperTone: "text-emerald-300",
    },
    metricRight: {
      title: "Audit events",
      value: "12.4k",
      helper: "Logged across workspaces",
    },
    bullets: [
      { color: "bg-sky-400", label: "Role-based access" },
      { color: "bg-emerald-400", label: "Field-level rules" },
      { color: "bg-fuchsia-400", label: "Full audit history" },
      { color: "bg-amber-400", label: "Exportable logs" },
    ],
  },
  {
    id: "insights",
    headerLabel: "Insights",
    headerTitle: "Decisions backed by data",
    statusLabel: "Live",
    statusTone: "bg-amber-500/90 text-amber-50 shadow-[0_0_18px_rgba(245,158,11,0.9)]",
    metricLeft: {
      title: "Reports",
      value: "22",
      helper: "Saved dashboards",
      helperTone: "text-emerald-300",
    },
    metricRight: {
      title: "Exports this week",
      value: "134",
      helper: "Shared with stakeholders",
    },
    bullets: [
      { color: "bg-sky-400", label: "Request trends" },
      { color: "bg-emerald-400", label: "Revenue by stage" },
      { color: "bg-indigo-400", label: "Team performance" },
      { color: "bg-amber-400", label: "Custom filters" },
    ],
  },
];

export default function FeatureCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % CARDS.length);
    }, 4800);

    return () => clearInterval(id);
  }, []);

  const getPositionClass = (cardIndex) => {
    if (cardIndex === index) {
      return "z-20 opacity-100 translate-y-0 scale-100";
    }

    const prev = (index - 1 + CARDS.length) % CARDS.length;
    const next = (index + 1) % CARDS.length;

    if (cardIndex === prev) {
      return "z-10 -translate-y-4 -translate-x-4 scale-95 opacity-60";
    }

    if (cardIndex === next) {
      return "z-10 -translate-y-4 translate-x-4 scale-95 opacity-60";
    }

    return "-z-10 opacity-0 scale-95 pointer-events-none";
  };

  return (
    <div className="relative h-80 w-full max-w-sm md:h-96 md:w-90">
      {CARDS.map((card, i) => (
        <div
          key={card.id}
          className={`absolute inset-0 overflow-hidden rounded-3xl border border-sky-500/40 bg-slate-900/90 p-4 shadow-[0_0_80px_rgba(56,189,248,0.7)] backdrop-blur-2xl transition-all duration-700 ease-out ${getPositionClass(
            i
          )}`}
        >
            <div className="absolute inset-px rounded-3xl bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.45),transparent_70%)] opacity-95" />
            <div className="relative flex h-full flex-col gap-4 text-[11px] text-slate-300">
              {/* Header row */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-950/70 px-4 py-3">
                <div>
                  <p className="text-[11px] text-slate-400">{card.headerLabel}</p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-50">
                    {card.headerTitle}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-medium ${card.statusTone}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-100 shadow-[0_0_10px_rgba(190,242,100,1)]" />
                  {card.statusLabel}
                </span>
              </div>

              {/* Metrics row */}
              <div className="grid flex-1 grid-cols-2 gap-3">
                <div className="flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-950/70 px-4 py-3">
                  <div>
                    <p className="text-[11px] text-slate-400">{card.metricLeft.title}</p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">
                      {card.metricLeft.value}
                    </p>
                  </div>
                  <p className={`mt-1 text-[11px] ${card.metricLeft.helperTone ?? "text-slate-400"}`}>
                    {card.metricLeft.helper}
                  </p>
                </div>
                <div className="flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-950/70 px-4 py-3">
                  <div>
                    <p className="text-[11px] text-slate-400">{card.metricRight.title}</p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">
                      {card.metricRight.value}
                    </p>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">{card.metricRight.helper}</p>
                </div>
              </div>

              {/* Bullet row */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 px-4 py-3">
                <p className="text-[11px] text-slate-400">What you get</p>
                <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1">
                  {card.bullets.map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-[11px] text-slate-300">
                      <span className={`h-1.5 w-1.5 rounded-full ${item.color}`} />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                <span>Auto-rotating overview</span>
                <div className="flex gap-1">
                  {CARDS.map((dot, dotIndex) => (
                    <span
                      key={dot.id}
                      className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                        dotIndex === index
                          ? "bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]"
                          : "bg-slate-600"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
