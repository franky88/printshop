import Link from "next/link";

export default function AdminSearch({ action, q, placeholder, filter }: { action: string; q: string; placeholder: string; filter?: string }) {
  return (
    <form action={action} method="get" role="search" className="mt-6 flex flex-wrap items-center gap-2">
      {filter && <input type="hidden" name="filter" value={filter} />}
      <input
        type="search"
        name="q"
        defaultValue={q}
        placeholder={placeholder}
        aria-label={placeholder}
        maxLength={100}
        className="min-h-11 w-full max-w-md rounded-sm border-2 border-ink/20 bg-paper px-3"
      />
      <button type="submit" className="min-h-11 rounded-full bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-cyan-ink">
        Search
      </button>
      {q && (
        <Link href={action} className="flex min-h-11 items-center text-sm text-cyan-ink underline underline-offset-4">
          Clear
        </Link>
      )}
    </form>
  );
}
