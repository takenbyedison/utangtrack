import { notFound, redirect } from "next/navigation";
import { FormField } from "@/components/form-field";
import { PageHeading } from "@/components/page-heading";
import { createClient } from "@/lib/supabase/server";

type LoanRow = {
  id: string;
  borrower_id: string;
  balance: number | string;
};

type BorrowerRow = {
  full_name: string;
};

async function createPayment(loanId: string, formData: FormData) {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth?error=Please%20log%20in%20before%20recording%20a%20payment.");
  }

  const amountText = String(formData.get("amount") ?? "").trim();
  const paidAt = String(formData.get("paid_at") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const amount = Number(amountText);

  if (!amountText || !paidAt) {
    redirect(
      `/loans/${loanId}/payments/new?error=${encodeURIComponent(
        "Amount and date are required."
      )}`
    );
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    redirect(
      `/loans/${loanId}/payments/new?error=${encodeURIComponent(
        "Amount must be greater than zero."
      )}`
    );
  }

  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .select("id, balance")
    .eq("id", loanId)
    .eq("lender_id", user.id)
    .single();

  if (loanError || !loan) {
    notFound();
  }

  const currentBalance = Number(loan.balance);
  const newBalance = Math.max(currentBalance - amount, 0);
  const newStatus = newBalance === 0 ? "paid" : "partially paid";

  const { error: paymentError } = await supabase.from("payments").insert({
    loan_id: loanId,
    lender_id: user.id,
    amount,
    paid_at: paidAt,
    note: note || null
  });

  if (paymentError) {
    redirect(
      `/loans/${loanId}/payments/new?error=${encodeURIComponent(
        "Could not save payment. Please try again."
      )}`
    );
  }

  const { error: loanUpdateError } = await supabase
    .from("loans")
    .update({
      balance: newBalance,
      status: newStatus
    })
    .eq("id", loanId)
    .eq("lender_id", user.id);

  if (loanUpdateError) {
    redirect(
      `/loans/${loanId}/payments/new?error=${encodeURIComponent(
        "Payment saved, but the remaining amount could not be updated."
      )}`
    );
  }

  redirect(`/loans/${loanId}`);
}

function formatPeso(amount: number | string) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0
  }).format(Number(amount));
}

export default async function AddPaymentPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth?error=Please%20log%20in%20before%20recording%20a%20payment.");
  }

  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .select("id, borrower_id, balance")
    .eq("id", id)
    .eq("lender_id", user.id)
    .single();

  if (loanError || !loan) {
    notFound();
  }

  const loanRow = loan as LoanRow;

  const { data: borrower } = await supabase
    .from("borrowers")
    .select("full_name")
    .eq("id", loanRow.borrower_id)
    .eq("lender_id", user.id)
    .single();

  const borrowerRow = borrower as BorrowerRow | null;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeading eyebrow="Add payment" title="Record money returned">
        Add a payment when this person gives money back. Remaining amount is{" "}
        {formatPeso(loanRow.balance)}.
      </PageHeading>

      <form
        action={createPayment.bind(null, loanRow.id)}
        className="space-y-4 rounded border border-ink/10 bg-white p-4"
      >
        {error ? (
          <p className="rounded border border-clay/20 bg-clay/5 px-3 py-2 text-sm text-clay">
            {error}
          </p>
        ) : null}

        <FormField label="Amount returned">
          <input
            className="focus-ring w-full rounded border border-ink/15 px-3 py-2"
            min="1"
            name="amount"
            placeholder="1000"
            required
            step="0.01"
            type="number"
          />
        </FormField>

        <FormField label="Date received">
          <input
            className="focus-ring w-full rounded border border-ink/15 px-3 py-2"
            name="paid_at"
            required
            type="date"
          />
        </FormField>

        <FormField label="Note">
          <input
            className="focus-ring w-full rounded border border-ink/15 px-3 py-2"
            name="note"
            placeholder="Cash, bank transfer, reference number, or note"
          />
        </FormField>

        <button
          className="focus-ring rounded bg-bay px-4 py-2 font-semibold text-white"
          type="submit"
        >
          Save payment
        </button>
      </form>
    </div>
  );
}
