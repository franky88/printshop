export const STATUSES = [
  "RECEIVED",
  "PAYMENT_SUBMITTED",
  "PAID",
  "IN_PRODUCTION",
  "READY",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
] as const;
export type Status = (typeof STATUSES)[number];

export const LABEL: Record<Status, string> = {
  RECEIVED: "Waiting for payment",
  PAYMENT_SUBMITTED: "Payment to verify",
  PAID: "Paid",
  IN_PRODUCTION: "Printing",
  READY: "Ready",
  SHIPPED: "Shipped",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const FILTERS: { key: string; label: string; statuses: readonly Status[] }[] = [
  { key: "open", label: "Open", statuses: ["RECEIVED", "PAYMENT_SUBMITTED", "PAID", "IN_PRODUCTION", "READY", "SHIPPED"] },
  { key: "verify", label: "To verify", statuses: ["PAYMENT_SUBMITTED"] },
  { key: "print", label: "To print", statuses: ["PAID", "IN_PRODUCTION"] },
  { key: "ready", label: "Ready", statuses: ["READY", "SHIPPED"] },
  { key: "closed", label: "Closed", statuses: ["COMPLETED", "CANCELLED"] },
  { key: "all", label: "All", statuses: STATUSES },
];

export type Move = { to: Status; label: string; tone: "primary" | "plain" | "danger"; deliveryOnly?: boolean };

const cancel: Move = { to: "CANCELLED", label: "Cancel order", tone: "danger" };

const MOVES: Record<Status, Move[]> = {
  RECEIVED: [{ to: "PAID", label: "Mark as paid", tone: "primary" }, cancel],
  PAYMENT_SUBMITTED: [
    { to: "PAID", label: "Confirm payment", tone: "primary" },
    { to: "RECEIVED", label: "Reject payment", tone: "plain" },
    cancel,
  ],
  PAID: [{ to: "IN_PRODUCTION", label: "Start printing", tone: "primary" }, cancel],
  IN_PRODUCTION: [{ to: "READY", label: "Mark ready", tone: "primary" }, cancel],
  READY: [
    { to: "COMPLETED", label: "Mark completed", tone: "primary" },
    { to: "SHIPPED", label: "Mark shipped", tone: "plain", deliveryOnly: true },
    cancel,
  ],
  SHIPPED: [{ to: "COMPLETED", label: "Mark completed", tone: "primary" }],
  COMPLETED: [],
  CANCELLED: [],
};

export function movesFor(status: string, delivery: string): Move[] {
  return (MOVES[status as Status] ?? []).filter((m) => !m.deliveryOnly || delivery === "DELIVERY");
}

export function canMove(from: string, to: string, delivery: string) {
  return movesFor(from, delivery).some((m) => m.to === to);
}

const fmt = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" });
export const fmtDate = (d: Date) => fmt.format(d);
