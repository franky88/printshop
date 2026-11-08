const steps = [
  {
    rule: "border-process-c",
    title: "Get your price",
    text: "Pick the product, the options, and the quantity. The total updates as you choose.",
  },
  {
    rule: "border-process-m",
    title: "Add your files",
    text: "Add the job to your order and upload your print file. No file yet? You can send it later.",
  },
  {
    rule: "border-process-y",
    title: "Pay and collect",
    text: "Place the order and pay by GCash, Maya, or bank transfer. We print it, and you pick it up or we deliver.",
  },
];

export default function HowItWorks() {
  return (
    <section aria-labelledby="how" className="mt-28">
      <h2 id="how" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
        How ordering works
      </h2>
      <ol className="mt-8 grid gap-8 sm:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className={`border-t-4 pt-4 ${s.rule}`}>
            <p className="font-display text-sm font-semibold tabular-nums text-ink/70">Step {i + 1}</p>
            <h3 className="mt-1 font-display text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 max-w-prose text-ink/75">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
