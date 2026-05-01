import Link from "next/link";
import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/server";
import type { LoanStatus } from "@/lib/types";
import { redirect } from "next/navigation";

type BorrowerRow = {
  id: string;
  full_name: string;
};

type LoanRow = {
  id: string;
  borrower_id: string;
  principal: number | string;
  balance: number | string;
  due_date: string;
  purpose: string;
  status: LoanStatus;
};

function formatPeso(amount: number | string) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0
  }).format(Number(amount));
}

export default async function LoansPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth?error=Please%20log%20in%20to%20view%20records.");
  }

  const [{ data: loans, error }, { data: borrowers }] = await Promise.all([
    supabase
      .from("loans")
      .select("id, borrower_id, principal, balance, due_date, purpose, status")
      .eq("lender_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("borrowers")
      .select("id, full_name")
      .eq("lender_id", user.id)
  ]);

  const loanRows = (loans ?? []) as LoanRow[];
  const borrowerRows = (borrowers ?? []) as BorrowerRow[];
  const borrowerNames = new Map(
    borrowerRows.map((borrower) => [borrower.id, borrower.full_name])
  );

  return (
    <div>
      <PageHeading eyebrow="Records" title="Your utang records">
        Everything you’ve tracked so far. Open any record to see details,
        payments, and confirmation status.
      </PageHeading>

      <div className="mb-5 flex flex-wrap gap-3">
        <Link
          className="focus-ring rounded bg-bay px-4 py-2 font-semibold text-white"
          href="/loans/new"
        >
          Add record
        </Link>
      </div>

      {error ? (
        <p className="mb-4 rounded border border-clay/20 bg-clay/5 px-3 py-2 text-sm text-clay">
          Could not load records. Please refresh and try again.
        </p>
      ) : null}

      <section className="overflow-hidden rounded border border-ink/10 bg-white">
        <div className="border-b border-ink/10 px-4 py-3">
          <h2 className="font-semibold">Record list</h2>
        </div>
        <div className="divide-y divide-ink/10">
          {loanRows.length > 0 ? (
            loanRows.map((loan) => (
              <Link
                className="focus-ring block p-4 hover:bg-mint"
                href={`/loans/${loan.id}`}
                key={loan.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {borrowerNames.get(loan.borrower_id) ?? "Person"}
                    </p>
                    <p className="text-sm text-ink/65">{loan.purpose}</p>
                  </div>
                  <StatusBadge status={loan.status} />
                </div>
                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                  <p>Gave: {formatPeso(loan.principal)}</p>
                  <p>Remaining: {formatPeso(loan.balance)}</p>
                  <p>Target date: {loan.due_date}</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-4 text-sm text-ink/70">
              <p className="font-semibold">No records yet.</p>
              <p className="mt-1">
                Add someone first, then save a shared record.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
