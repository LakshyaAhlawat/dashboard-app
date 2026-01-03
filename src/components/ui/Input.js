export function Input({ className = "", ...props }) {
  const base =
    "w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 sm:text-sm";

  return <input className={`${base} ${className}`} {...props} />;
}
