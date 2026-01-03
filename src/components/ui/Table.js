export function Table({ children, className = "" }) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={`min-w-full border-separate border-spacing-0 text-left text-xs md:text-sm ${className}`}
      >
        {children}
      </table>
    </div>
  );
}

export function THead({ children }) {
  return (
    <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wide text-slate-400">
      {children}
    </thead>
  );
}

export function TBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function TR({ children, tone }) {
  const base = tone === "muted" ? "bg-slate-950/70" : "bg-slate-950";
  return <tr className={base}>{children}</tr>;
}

export function TH({ children }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}

export function TD({ children, align = "left" }) {
  const alignClass = align === "right" ? "text-right" : "text-left";
  return (
    <td className={`whitespace-nowrap px-4 py-3 text-slate-200 ${alignClass}`}>
      {children}
    </td>
  );
}
