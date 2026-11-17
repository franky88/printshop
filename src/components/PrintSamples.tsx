// Decorative print samples, not logo artwork or product photographs.
export default function PrintSamples() {
  return (
    <div aria-hidden="true" className="relative isolate mx-auto flex min-h-80 w-full max-w-md items-center justify-center overflow-hidden rounded-3xl bg-ink p-8 sm:min-h-100">
      <div className="absolute -right-9 -top-9 h-48 w-48 rounded-full border border-white/10" />
      <div className="absolute -bottom-16 -left-8 h-64 w-64 rounded-full border border-white/10" />
      <div className="absolute h-60 w-44 -translate-x-8 -translate-y-3 -rotate-12 rounded-lg bg-mint sm:h-68 sm:w-50" />
      <div className="absolute h-60 w-44 translate-x-9 translate-y-3 rotate-12 rounded-lg bg-gold sm:h-68 sm:w-50" />
      <div className="relative flex h-64 w-48 -rotate-3 flex-col justify-between rounded-lg bg-sheet p-6 shadow-xl sm:h-72 sm:w-54">
        <div className="flex gap-1.5">
          <span className="h-2 w-8 rounded-xl bg-teal" />
          <span className="h-2 w-2 rounded-full bg-mint" />
          <span className="h-2 w-2 rounded-full bg-gold" />
        </div>
        <p className="font-display text-3xl font-black leading-[1.05] tracking-tight sm:text-4xl">Good things<br />start on<br />paper.</p>
        <div className="space-y-2">
          <div className="h-1.5 w-full rounded bg-ink/15" />
          <div className="h-1.5 w-2/3 rounded bg-ink/15" />
        </div>
      </div>
    </div>
  );
}
