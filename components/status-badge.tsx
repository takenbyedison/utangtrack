import type { LoanStatus } from "@/lib/types";

const statusStyles: Record<LoanStatus, string> = {
  "pending confirmation": "bg-mango/20 text-ink",
  confirmed: "bg-bay/15 text-bay",
  disputed: "bg-clay/15 text-clay",
  active: "bg-sky-100 text-sky-800",
  overdue: "bg-red-100 text-red-800",
  "partially paid": "bg-violet-100 text-violet-800",
  paid: "bg-emerald-100 text-emerald-800"
};

export function StatusBadge({ status }: { status: LoanStatus }) {
  return (
    <span
      className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
