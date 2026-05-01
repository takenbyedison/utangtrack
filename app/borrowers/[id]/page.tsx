import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/server";
import type { LoanStatus } from "@/lib/types";

type BorrowerRow = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
};

type LoanRow = {
  id: string;
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

export default async function BorrowerDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth?error=Please%20log%20in%20to%20view%20people.");
  }

  const { data: borrower, error: borrowerError } = await supabase
    .from("borrowers")
    .select("id, full_name, phone, email, notes")
    .eq("id", id)
    .eq("lender_id", user.id)
    .single();

  if (borrowerError || !borrower) {
    notFound();
  }

  const { data: loans, error: loansError } = await supabase
    .from("loans")
    .select("id, principal, balance, due_date, purpose, status")
    .eq("borrower_id", id)
    .eq("lender_id", user.id)
    .order("created_at", { ascending: false });

  const borrowerRow = borrower as BorrowerRow;
  const loanRows = (loans ?? []) as LoanRow[];

  return (
    <div>
      <PageHeading eyebrow="Person" title={borrowerRow.full_name}>
        All shared records with this person.
      </PageHeading>

      {loansError ? (
        <p className="mb-4 rounded border border-clay/20 bg-clay/5 px-3 py-2 text-sm text-clay">
          Could not load shared records. Please refresh and try again.
        </p>
      ) : null}

      <div className="mb-5 flex flex-wrap gap-3">
        <Link
          className="focus-ring rounded bg-bay px-4 py-2 font-semibold text-white"
          href="/loans/new"
        >
          Add new record
        </Link>
        <Link
          className="focus-ring rounded border border-ink/15 px-4 py-2 font-semibold text-ink"
          href="/borrowers"
        >
          Back to people
        </Link>
      </div>

      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="rounded border border-ink/10 bg-white p-4">
          <h2 className="font-semibold">Contact details</h2>
          <div className="mt-3 space-y-2 text-sm text-ink/75">
            <p>{borrowerRow.phone || "No phone saved"}</p>
            <p>{borrowerRow.email || "No email saved"}</p>
            {borrowerRow.notes ? <p>{borrowerRow.notes}</p> : null}
          </div>
        </aside>

        <section className="overflow-hidden rounded border border-ink/10 bg-white">
          <div className="border-b border-ink/10 px-4 py-3">
            <h2 className="font-semibold">Shared records</h2>
          </div>
          <div className="divide-y divide-ink/10">
            {loanRows.length > 0 ? (
              loanRows.map((loan) => (
                <Link
                  className="focus-ring block p-4 hover:bg-bay/5"
                  href={`/loans/${loan.id}`}
                  key={loan.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{loan.purpose}</p>
                      <p className="text-sm text-ink/65">
                        Target date: {loan.due_date}
                      </p>
                    </div>
                    <StatusBadge status={loan.status} />
                  </div>
                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <p>Gave: {formatPeso(loan.principal)}</p>
                    <p>Remaining: {formatPeso(loan.balance)}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-4 text-sm text-ink/70">
                <p className="font-semibold">No records yet.</p>
                <p className="mt-1">Add one when you’re ready.</p>
              </div>
            )}
          </div>
        </section>
      </section>
    </div>
  );
}
