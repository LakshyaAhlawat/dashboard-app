export function Button({ variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-medium transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

  const variants = {
    primary:
      "bg-sky-500 text-white hover:bg-sky-400 shadow-sky-500/40 focus-visible:ring-sky-500",
    outline:
      "border border-slate-700 bg-slate-900 text-slate-100 hover:border-sky-500 hover:text-sky-200",
    ghost:
      "text-slate-300 hover:bg-slate-900",
  };

  const classes = `${base} ${variants[variant] || variants.primary} ${className}`;

  return <button className={classes} {...props} />;
}
