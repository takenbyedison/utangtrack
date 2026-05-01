import type { LoanStatus } from "@/lib/types";

const statusStyles: Record<LoanStatus, string> = {
  "pending confirmation": "bg-amber-100 text-amber-900",
  confirmed: "bg-mint text-moss",
  disputed: "bg-red-50 text-clay",
  active: "bg-blue-50 text-blue-800",
  overdue: "bg-red-100 text-red-800",
  "partially paid": "bg-indigo-50 text-indigo-800",
  paid: "bg-emerald-100 text-emerald-800"
};

const statusLabels: Record<LoanStatus, string> = {
  "pending confirmation": "Waiting for confirmation",
  confirmed: "Agreed",
  disputed: "Needs discussion",
  active: "Active",
  overdue: "Past target date",
  "partially paid": "Partly paid",
  paid: "Settled"
};

export function StatusBadge({ status }: { status: LoanStatus }) {
  return (
    <span
      className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
