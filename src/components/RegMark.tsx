// A press registration target with the four process inks (C, M, Y, K) in the middle.
export default function RegMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className}>
      <circle cx="16" cy="16" r="11" fill="none" stroke="#15171c" strokeWidth="1.6" />
      <path d="M16 1v30M1 16h30" stroke="#15171c" strokeWidth="1.6" />
      <circle cx="12.6" cy="12.6" r="3.1" fill="#00a6e6" />
      <circle cx="19.4" cy="12.6" r="3.1" fill="#e5007d" />
      <circle cx="12.6" cy="19.4" r="3.1" fill="#ffd60a" />
      <circle cx="19.4" cy="19.4" r="3.1" fill="#15171c" />
    </svg>
  );
}
