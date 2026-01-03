"use client";

import { useState } from "react";

export function DropdownMenu({ trigger, children, align = "right" }) {
  const [open, setOpen] = useState(false);

  const alignmentClass = align === "left" ? "left-0" : "right-0";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="outline-none"
      >
        {trigger}
      </button>
      {open && (
        <div
          className={`absolute z-40 mt-2 min-w-48 max-h-60 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/95 p-1.5 text-xs text-slate-200 shadow-xl shadow-slate-950/80 backdrop-blur-xl ${alignmentClass}`}
        >
          {typeof children === "function" ? children(() => setOpen(false)) : children}
        </div>
      )}
    </div>
  );
}
