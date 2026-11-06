export const QUOTE_STATUSES = ["NEW", "REPLIED", "CLOSED"] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const QUOTE_LABEL: Record<QuoteStatus, string> = { NEW: "New", REPLIED: "Replied", CLOSED: "Closed" };

export const QUOTE_FILTERS: { key: string; label: string; statuses: readonly QuoteStatus[] }[] = [
  { key: "new", label: "New", statuses: ["NEW"] },
  { key: "replied", label: "Replied", statuses: ["REPLIED"] },
  { key: "closed", label: "Closed", statuses: ["CLOSED"] },
  { key: "all", label: "All", statuses: QUOTE_STATUSES },
];

export type QuoteMove = { to: QuoteStatus; label: string; tone: "primary" | "plain" };

const MOVES: Record<QuoteStatus, QuoteMove[]> = {
  NEW: [
    { to: "REPLIED", label: "Mark replied", tone: "primary" },
    { to: "CLOSED", label: "Close", tone: "plain" },
  ],
  REPLIED: [
    { to: "CLOSED", label: "Close", tone: "primary" },
    { to: "NEW", label: "Reopen", tone: "plain" },
  ],
  CLOSED: [{ to: "NEW", label: "Reopen", tone: "plain" }],
};

export const quoteMoves = (status: string): QuoteMove[] => MOVES[status as QuoteStatus] ?? [];
export const canMoveQuote = (from: string, to: string) => quoteMoves(from).some((m) => m.to === to);

// Blob links end in "name-randomsuffix.ext"; show that as the file name.
export function fileName(url: string) {
  try {
    return decodeURIComponent(new URL(url).pathname.split("/").pop() ?? "file");
  } catch {
    return "file";
  }
}
