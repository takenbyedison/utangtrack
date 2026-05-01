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
  status: LoanStatus;
  purpose: string;
  due_date: string;
  created_at: string;
};

type PaymentRow = {
  amount: number | string;
  paid_at: string;
};

async function logOut() {
  "use server";

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth");
}

function formatPeso(amount: number | string) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0
  }).format(Number(amount));
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth?error=Please%20log%20in%20to%20view%20your%20dashboard.");
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthStartIso = monthStart.toISOString().slice(0, 10);

  const [
    { data: borrowers, error: borrowersError },
    { data: loans, error: loansError },
    { data: payments, error: paymentsError }
  ] = await Promise.all([
      supabase
        .from("borrowers")
        .select("id, full_name")
        .eq("lender_id", user.id)
        .order("full_name", { ascending: true }),
      supabase
        .from("loans")
        .select(
          "id, borrower_id, principal, balance, status, purpose, due_date, created_at"
        )
        .eq("lender_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("payments")
        .select("amount, paid_at")
        .eq("lender_id", user.id)
        .gte("paid_at", monthStartIso)
    ]);

  const borrowerRows = (borrowers ?? []) as BorrowerRow[];
  const loanRows = (loans ?? []) as LoanRow[];
  const paymentRows = (payments ?? []) as PaymentRow[];
  const borrowerNames = new Map(
    borrowerRows.map((borrower) => [borrower.id, borrower.full_name])
  );
  const totalLent = loanRows.reduce(
    (sum, loan) => sum + Number(loan.principal),
    0
  );
  const totalOutstanding = loanRows.reduce(
    (sum, loan) => sum + Number(loan.balance),
    0
  );
  const collectedThisMonth = paymentRows.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );
  const loadError = borrowersError || loansError || paymentsError;

  return (
    <div>
      <PageHeading eyebrow="Dashboard" title="Your money at a glance">
        See who still needs to pay, what has been returned, and what needs
        attention.
      </PageHeading>

      {loadError ? (
        <p className="mb-4 rounded border border-clay/20 bg-clay/5 px-3 py-2 text-sm text-clay">
          Could not load dashboard data. Please refresh and try again.
        </p>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded border border-ink/10 bg-white p-4 shadow-sm">
          <p className="text-sm text-ink/65">Total you gave</p>
          <p className="mt-1 text-2xl font-bold">{formatPeso(totalLent)}</p>
        </div>
        <div className="rounded border border-ink/10 bg-white p-4 shadow-sm">
          <p className="text-sm text-ink/65">Still unpaid</p>
          <p className="mt-1 text-2xl font-bold">{formatPeso(totalOutstanding)}</p>
        </div>
        <div className="rounded border border-ink/10 bg-white p-4 shadow-sm">
          <p className="text-sm text-ink/65">Received this month</p>
          <p className="mt-1 text-2xl font-bold">
            {formatPeso(collectedThisMonth)}
          </p>
        </div>
        <Link
          className="focus-ring rounded border border-ink/10 bg-white p-4 shadow-sm hover:bg-mint"
          href="/borrowers"
        >
          <p className="text-sm text-ink/65">People</p>
          <p className="mt-1 text-2xl font-bold">{borrowerRows.length}</p>
        </Link>
        <div className="rounded border border-ink/10 bg-white p-4 shadow-sm">
          <p className="text-sm text-ink/65">Records</p>
          <p className="mt-1 text-2xl font-bold">{loanRows.length}</p>
        </div>
      </section>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          className="focus-ring rounded bg-bay px-4 py-2 font-semibold text-white"
          href="/borrowers/new"
        >
          Add someone
        </Link>
        <Link
          className="focus-ring rounded border border-ink/15 px-4 py-2 font-semibold"
          href="/loans/new"
        >
          Add record
        </Link>
        <form action={logOut}>
          <button
            className="focus-ring rounded border border-ink/15 px-4 py-2 font-semibold text-ink"
            type="submit"
          >
            Log out
          </button>
        </form>
      </div>

      <section className="mt-6 overflow-hidden rounded border border-ink/10 bg-white">
        <div className="border-b border-ink/10 px-4 py-3">
          <h2 className="font-semibold">Recent records</h2>
        </div>
        <div className="divide-y divide-ink/10">
          {loanRows.length > 0 ? (
            loanRows.slice(0, 10).map((loan) => (
              <Link
                className="focus-ring block p-4 hover:bg-bay/5"
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
                Add someone, then save a shared record when you are ready.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
