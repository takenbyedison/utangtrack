import Link from "next/link";
import { PageHeading } from "@/components/page-heading";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type BorrowerRow = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
};

type LoanSummaryRow = {
  borrower_id: string;
  status: string;
};

function getLoanCounts(loans: LoanSummaryRow[], borrowerId: string) {
  const borrowerLoans = loans.filter((loan) => loan.borrower_id === borrowerId);

  return {
    total: borrowerLoans.length,
    active: borrowerLoans.filter((loan) => loan.status !== "paid").length,
    paid: borrowerLoans.filter((loan) => loan.status === "paid").length,
    disputed: borrowerLoans.filter((loan) => loan.status === "disputed").length
  };
}

export default async function BorrowersPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth?error=Please%20log%20in%20to%20view%20people.");
  }

  const [{ data, error }, { data: loans, error: loansError }] = await Promise.all([
    supabase
      .from("borrowers")
      .select("id, full_name, phone, email, notes")
      .eq("lender_id", user.id)
      .order("full_name", { ascending: true }),
    supabase
      .from("loans")
      .select("borrower_id, status")
      .eq("lender_id", user.id)
  ]);

  const borrowers = (data ?? []) as BorrowerRow[];
  const loanRows = (loans ?? []) as LoanSummaryRow[];
  const loadError = error || loansError;

  return (
    <div>
      <PageHeading eyebrow="People" title="People you’ve helped">
        These are the people you’ve shared money with. Each one has their own
        private record.
      </PageHeading>

      <div className="mb-5 flex flex-wrap gap-3">
        <Link
          className="focus-ring rounded bg-bay px-4 py-2 font-semibold text-white"
          href="/borrowers/new"
        >
          Add someone
        </Link>
      </div>

      {loadError ? (
        <p className="mb-4 rounded border border-clay/20 bg-clay/5 px-3 py-2 text-sm text-clay">
          Could not load people. Please refresh and try again.
        </p>
      ) : null}

      <section className="overflow-hidden rounded border border-ink/10 bg-white">
        <div className="border-b border-ink/10 px-4 py-3">
          <h2 className="font-semibold">Your people</h2>
        </div>
        <div className="divide-y divide-ink/10">
          {borrowers.length > 0 ? (
            borrowers.map((borrower) => {
              const counts = getLoanCounts(loanRows, borrower.id);

              return (
                <Link
                  className="focus-ring group block p-4 transition hover:bg-bay/5"
                  href={`/borrowers/${borrower.id}`}
                  key={borrower.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-semibold">{borrower.full_name}</p>
                    <span className="text-sm font-semibold text-bay group-hover:underline">
                      View details -&gt;
                    </span>
                  </div>
                  <div className="mt-2 grid gap-1 text-sm text-ink/70 sm:grid-cols-2">
                    <p>{borrower.phone || "No phone saved"}</p>
                    <p>{borrower.email || "No email saved"}</p>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-4">
                    <p>Records: {counts.total}</p>
                    <p>Still unpaid: {counts.active}</p>
                    <p>Settled: {counts.paid}</p>
                    <p>Needs discussion: {counts.disputed}</p>
                  </div>
                  {borrower.notes ? (
                    <p className="mt-3 text-sm text-ink/70">{borrower.notes}</p>
                  ) : null}
                </Link>
              );
            })
          ) : (
            <div className="p-4 text-sm text-ink/70">
              <p className="font-semibold">No people yet.</p>
              <p className="mt-1">
                Add someone before creating a shared record.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
