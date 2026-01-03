export default function SparklesBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Soft gradient orbs */}
      <div className="orb-float-soft absolute -left-40 -top-40 h-80 w-80 rounded-full bg-sky-500/40 blur-3xl" />
      <div className="orb-float-soft-reverse absolute -right-52 -bottom-56 h-104 w-104 rounded-full bg-indigo-600/40 blur-3xl" />
      <div className="orb-float-soft absolute left-1/4 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-emerald-400/26 blur-3xl" />
      <div className="orb-float-soft-reverse absolute right-1/3 top-10 h-52 w-52 rounded-full bg-sky-400/28 blur-3xl" />

      {/* Subtle radial mesh behind content */}
      <div className="bg-pan-soft absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.3),transparent_55%),radial-gradient(circle_at_bottom,rgba(129,140,248,0.34),transparent_60%)] opacity-90" />

      {/* Sparkle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(148,163,184,0.35)_0,transparent_32%,transparent_68%,rgba(148,163,184,0.28)_100%),radial-gradient(circle_at_top_left,rgba(56,189,248,0.3),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.32),transparent_55%)] mix-blend-screen opacity-80" />

      {/* Faint noise for texture */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%204%204%22%3E%3Ccircle%20cx=%220.5%22%20cy=%220.5%22%20r=%220.5%22%20fill=%22rgba(148,163,184,0.45)%22/%3E%3C/svg%3E')] opacity-[0.16] mix-blend-soft-light" />

      {/* Highlight ring under the right analytics card */}
      <div className="absolute right-[8%] top-1/2 hidden h-48 w-80 -translate-y-1/2 rounded-[999px] bg-linear-to-r from-sky-500/40 via-emerald-400/30 to-indigo-500/40 blur-3xl lg:block" />
    </div>
  );
}
