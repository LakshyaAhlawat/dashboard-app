export function Badge({ tone = "neutral", className = "", children }) {
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium";

  const tones = {
    positive: "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/40",
    negative: "bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/40",
    warning: "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/40",
    neutral: "bg-slate-800/60 text-slate-200 ring-1 ring-slate-700/60",
  };

  const classes = `${base} ${tones[tone] || tones.neutral} ${className}`;

  return <span className={classes}>{children}</span>;
}
