import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CreditCard } from "lucide-react";
import { CopyInviteLink } from "@/components/copy-invite-link";
import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/server";
import type { LoanStatus } from "@/lib/types";
import { headers } from "next/headers";

type LoanRow = {
  id: string;
  borrower_id: string;
  principal: number | string;
  balance: number | string;
  due_date: string;
  purpose: string;
  status: LoanStatus;
  confirmation_token: string;
};

type BorrowerRow = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
};

type PaymentRow = {
  id: string;
  amount: number | string;
  paid_at: string;
  note: string | null;
};

function formatPeso(amount: number | string) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0
  }).format(Number(amount));
}

export default async function LoanDetailPage({
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
    redirect("/auth?error=Please%20log%20in%20to%20view%20this%20loan.");
  }

  const headerStore = await headers();
  const host = headerStore.get("host") ?? "";
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  const appOrigin = host ? `${protocol}://${host}` : "";

  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .select(
      "id, borrower_id, principal, balance, due_date, purpose, status, confirmation_token"
    )
    .eq("id", id)
    .eq("lender_id", user.id)
    .single();

  if (loanError || !loan) {
    notFound();
  }

  const loanRow = loan as LoanRow;
  const invitePath = `/confirm/${loanRow.confirmation_token}`;
  const inviteUrl = `${appOrigin}${invitePath}`;

  const [{ data: borrower }, { data: payments }] = await Promise.all([
    supabase
      .from("borrowers")
      .select("id, full_name, phone, email")
      .eq("id", loanRow.borrower_id)
      .eq("lender_id", user.id)
      .single(),
    supabase
      .from("payments")
      .select("id, amount, paid_at, note")
      .eq("loan_id", loanRow.id)
      .eq("lender_id", user.id)
      .order("paid_at", { ascending: false })
  ]);

  const borrowerRow = borrower as BorrowerRow | null;
  const paymentRows = (payments ?? []) as PaymentRow[];

  return (
    <div>
      <PageHeading
        eyebrow="Loan detail"
        title={borrowerRow?.full_name ?? "Borrower"}
      >
        Private record owned by your lender account.
      </PageHeading>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded border border-ink/10 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">{loanRow.purpose}</h2>
            <StatusBadge status={loanRow.status} />
          </div>

          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-ink/60">Principal</dt>
              <dd className="font-semibold">{formatPeso(loanRow.principal)}</dd>
            </div>
            <div>
              <dt className="text-ink/60">Balance</dt>
              <dd className="font-semibold">{formatPeso(loanRow.balance)}</dd>
            </div>
            <div>
              <dt className="text-ink/60">Due date</dt>
              <dd className="font-semibold">{loanRow.due_date}</dd>
            </div>
            <div>
              <dt className="text-ink/60">Status</dt>
              <dd className="font-semibold">{loanRow.status}</dd>
            </div>
          </dl>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              className="focus-ring inline-flex items-center gap-2 rounded bg-bay px-4 py-2 font-semibold text-white"
              href={`/loans/${loanRow.id}/payments/new`}
            >
              <CreditCard className="h-4 w-4" />
              Add payment
            </Link>
          </div>
        </div>

        <aside className="rounded border border-ink/10 bg-white p-4">
          <h2 className="font-semibold">Borrower profile</h2>
          <div className="mt-3 space-y-2 text-sm text-ink/75">
            <p className="font-semibold">{borrowerRow?.full_name ?? "Borrower"}</p>
            {borrowerRow?.phone ? <p>{borrowerRow.phone}</p> : null}
            {borrowerRow?.email ? <p>{borrowerRow.email}</p> : null}
            {!borrowerRow?.phone && !borrowerRow?.email ? (
              <p>No contact details saved.</p>
            ) : null}
          </div>
        </aside>
      </section>

      <section className="mt-6 rounded border border-ink/10 bg-white">
        <div className="border-b border-ink/10 px-4 py-3">
          <h2 className="font-semibold">Borrower invite</h2>
        </div>
        <div className="p-4 text-sm text-ink/75">
          <p>
            Send this confirmation link to the borrower by email or SMS later.
            For now, UtangTrack only creates the invite link and does not send
            messages.
          </p>
          <div className="mt-3 overflow-hidden rounded border border-ink/15 bg-paper px-3 py-2 font-mono text-xs text-ink">
            {inviteUrl || invitePath}
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <CopyInviteLink inviteUrl={inviteUrl || invitePath} />
            <Link
              className="focus-ring rounded border border-ink/15 px-4 py-2 font-semibold text-ink"
              href={invitePath}
            >
              Open invite
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded border border-ink/10 bg-white">
        <div className="border-b border-ink/10 px-4 py-3">
          <h2 className="font-semibold">Payment history</h2>
        </div>
        <div className="divide-y divide-ink/10">
          {paymentRows.length > 0 ? (
            paymentRows.map((payment) => (
              <div key={payment.id} className="p-4 text-sm">
                <p className="font-semibold">{formatPeso(payment.amount)}</p>
                <p className="text-ink/65">
                  {payment.paid_at}
                  {payment.note ? ` - ${payment.note}` : ""}
                </p>
              </div>
            ))
          ) : (
            <p className="p-4 text-sm text-ink/65">
              No payments recorded yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
