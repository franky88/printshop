export default function FileTips() {
  return (
    <section aria-labelledby="files" className="mt-28 grid items-center gap-10 lg:grid-cols-2">
      <div>
        <h2 id="files" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Send files that print well
        </h2>
        <ul className="mt-6 max-w-prose space-y-4 text-ink/80">
          <li>
            <strong className="text-ink">Export a PDF.</strong> It keeps your fonts and layout exactly as designed.
          </li>
          <li>
            <strong className="text-ink">Use 300 dpi images.</strong> Lower resolution looks soft on paper.
          </li>
          <li>
            <strong className="text-ink">Extend backgrounds into the bleed</strong> if your design runs to the edge, so
            no white line shows after trimming.
          </li>
          <li>
            <strong className="text-ink">Keep text inside the safe area</strong> so nothing gets cut off.
          </li>
        </ul>
      </div>

      <figure className="rounded-3xl bg-paper p-6">
        <svg
          viewBox="0 0 320 220"
          role="img"
          aria-label="A sheet showing the bleed area outside the trim line and the safe area inside it"
          className="mx-auto w-full max-w-md"
        >
          <rect x="38" y="28" width="244" height="164" className="fill-process-m/20" />
          <rect x="52" y="42" width="216" height="136" className="fill-paper stroke-ink" strokeWidth="1.5" />
          <rect x="70" y="60" width="180" height="100" fill="none" className="stroke-process-c" strokeWidth="1.5" strokeDasharray="5 4" />
          <text x="160" y="116" textAnchor="middle" className="fill-ink text-[13px] font-semibold">
            Your design
          </text>
          <g className="stroke-ink" strokeWidth="1.2">
            <path d="M52 8v24M8 42h24M268 8v24M312 42h-24M52 212v-24M8 178h24M268 212v-24M312 178h-24" />
          </g>
        </svg>
        <figcaption className="mt-4 space-y-2 text-sm">
          <p className="flex items-center gap-3">
            <span aria-hidden className="h-3 w-6 shrink-0 rounded-sm bg-process-m/40" />
            Bleed: 3 mm of background past the trim line
          </p>
          <p className="flex items-center gap-3">
            <span aria-hidden className="h-0 w-6 shrink-0 border-t-2 border-ink" />
            Trim line: where the sheet is cut
          </p>
          <p className="flex items-center gap-3">
            <span aria-hidden className="h-0 w-6 shrink-0 border-t-2 border-dashed border-process-c" />
            Safe area: keep text 5 mm inside the trim
          </p>
        </figcaption>
      </figure>
    </section>
  );
}
