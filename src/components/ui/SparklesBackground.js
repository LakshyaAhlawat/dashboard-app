export default function SparklesBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Deep galaxy base */}
      <div className="absolute inset-0 bg-linear-to-b from-slate-950 via-slate-950 to-slate-950" />

      {/* Bright radial galaxy glow behind the hero (very visible) */}
      <div className="absolute -left-20 top-10 h-130 w-130 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.9),rgba(15,23,42,0)_70%)] blur-3xl opacity-90" />

      {/* Swirling nebula rings */}
      <div className="pointer-events-none absolute -left-1/3 top-1/4 h-[180%] w-[180%] -translate-y-1/4 rounded-full border border-sky-400/50 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.45),transparent_65%)] opacity-90 mix-blend-screen animate-[spin_60s_linear_infinite]" />
      <div className="pointer-events-none absolute -right-1/3 top-0 h-[170%] w-[170%] rounded-full border border-indigo-400/50 bg-[radial-gradient(circle_at_center,rgba(129,140,248,0.45),transparent_70%)] opacity-80 mix-blend-screen animate-[spin_90s_linear_infinite]" />

      {/* Star fields (parallax layers) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(148,163,184,0.9)_0,transparent_55%)] bg-size-[2px_2px] bg-repeat opacity-[0.4]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(248,250,252,1)_0,transparent_65%)] bg-size-[1px_1px] bg-repeat opacity-[0.5] mix-blend-screen animate-[pulse_4s_ease-in-out_infinite]" />

      {/* Floating glow bubbles to make the motion obvious */}
      <div className="pointer-events-none absolute -left-10 top-1/3 h-56 w-56 rounded-full bg-linear-to-tr from-sky-500/90 via-cyan-400/60 to-transparent blur-3xl opacity-95 animate-pulse" />
      <div className="pointer-events-none absolute -right-10 bottom-4 h-72 w-72 rounded-full bg-linear-to-tr from-indigo-500/90 via-fuchsia-500/60 to-transparent blur-3xl opacity-95 animate-pulse" />

      {/* Soft color fog to anchor the hero content */}
      <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-tr from-sky-500/70 via-emerald-400/50 to-indigo-500/60 blur-3xl opacity-90" />

      {/* Faint noise for texture */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%204%204%22%3E%3Ccircle%20cx=%220.5%22%20cy=%220.5%22%20r=%220.5%22%20fill=%22rgba(148,163,184,0.55)%22/%3E%3C/svg%3E')] opacity-[0.18] mix-blend-soft-light" />
    </div>
  );
}
