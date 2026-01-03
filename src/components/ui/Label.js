export function Label({ className = "", children, ...props }) {
  const base = "block text-[11px] font-medium text-slate-300 sm:text-xs";
  return (
    <label className={`${base} ${className}`} {...props}>
      {children}
    </label>
  );
}
