const steps = [
  {
    number: "01",
    title: "Get your price",
    text: "Pick the product, the options, and the quantity. The total updates as you choose.",
  },
  {
    number: "02",
    title: "Add your files",
    text: "Add the job to your order and upload your print file. No file yet? You can send it later.",
  },
  {
    number: "03",
    title: "Pay and collect",
    text: "Place the order and pay by GCash, Maya, or bank transfer. We print it, and you pick it up or we deliver.",
  },
];

export default function HowItWorks() {
  return (
    <section aria-labelledby="how" className="mt-16 border-t border-ink/15 pt-12 sm:mt-24 sm:pt-16">
      <p className="eyebrow">From quote to collection</p>
      <h2 id="how" className="mt-2 font-display text-3xl font-black tracking-tight sm:text-4xl">
        A few simple steps. Then it&rsquo;s printed.
      </h2>
      <ol className="mt-8 grid gap-4 sm:grid-cols-3">
        {steps.map((s) => (
          <li key={s.title} className="surface rounded-2xl p-6">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-teal/10 font-black tabular-nums text-teal">{s.number}</span>
            <h3 className="mt-5 font-display text-xl font-black">{s.title}</h3>
            <p className="mt-2 max-w-prose text-ink/75">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
