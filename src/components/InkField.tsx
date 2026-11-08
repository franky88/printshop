"use client";

import { useEffect, useRef } from "react";

// Three overprinting ink circles behind the quote slip. They drift a little with the pointer.
export default function InkField() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || matchMedia("(pointer: coarse)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--px", (e.clientX / innerWidth - 0.5).toFixed(3));
        el.style.setProperty("--py", (e.clientY / innerHeight - 0.5).toFixed(3));
      });
    };
    addEventListener("pointermove", onMove);
    return () => {
      removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const shift = (k: number) => ({ transform: `translate(calc(var(--px, 0) * ${k}px), calc(var(--py, 0) * ${k}px))` });

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute left-8 top-[-3.75rem]" style={shift(34)}>
        <div className="ink h-60 w-60 rounded-full bg-process-c" />
      </div>
      <div className="absolute right-[-3rem] top-[-1.25rem]" style={shift(-28)}>
        <div className="ink ink-2 h-60 w-60 rounded-full bg-process-m" />
      </div>
      <div className="absolute left-[5.5rem] top-36" style={shift(42)}>
        <div className="ink ink-3 h-60 w-60 rounded-full bg-process-y" />
      </div>
    </div>
  );
}
