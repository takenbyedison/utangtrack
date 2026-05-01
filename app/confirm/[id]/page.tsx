import { notFound, redirect } from "next/navigation";
import { FormField } from "@/components/form-field";
import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/server";
import type { LoanStatus } from "@/lib/types";

type ConfirmationLoan = {
  loan_id: string;
  shared_by: string;
  borrower_name: string;
  purpose: string;
  principal: number | string;
  due_date: string;
  status: LoanStatus;
  borrower_response: "confirmed" | "disputed" | null;
  dispute_reason: string | null;
};

async function submitBorrowerResponse(token: string, formData: FormData) {
  "use server";

  const response = String(formData.get("response") ?? "").trim();
  const disputeReason = String(formData.get("dispute_reason") ?? "").trim();

  if (response !== "confirmed" && response !== "disputed") {
    redirect(
      `/confirm/${token}?error=${encodeURIComponent("Please choose a response.")}`
    );
  }

  if (response === "disputed" && !disputeReason) {
    redirect(
      `/confirm/${token}?error=${encodeURIComponent(
        "Please tell us what needs to be corrected."
      )}`
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_loan_confirmation", {
    invite_token: token,
    response_value: response,
    dispute_reason_value: disputeReason || null
  });

  if (error || !data || data.length === 0) {
    redirect(
      `/confirm/${token}?error=${encodeURIComponent(
        "Could not save your response. Please try again."
      )}`
    );
  }

  redirect(`/confirm/${token}?saved=${response}`);
}

function formatPeso(amount: number | string) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0
  }).format(Number(amount));
}

export default async function BorrowerConfirmationPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { id } = await params;
  const { error, saved } = await searchParams;
  const supabase = await createClient();

  const { data, error: fetchError } = await supabase.rpc(
    "get_loan_confirmation",
    {
      invite_token: id
    }
  );

  if (fetchError || !data || data.length === 0) {
    notFound();
  }

  const loan = data[0] as ConfirmationLoan;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeading eyebrow="Review record" title="Please review this utang record">
        Someone shared this record with you so both sides can stay clear.
      </PageHeading>

      {saved ? (
        <p className="mb-4 rounded border border-bay/20 bg-bay/5 px-3 py-2 text-sm text-bay">
          {saved === "disputed"
            ? "Your correction was sent."
            : "Thank you. This record is now marked as agreed."}
        </p>
      ) : null}

      {error ? (
        <p className="mb-4 rounded border border-clay/20 bg-clay/5 px-3 py-2 text-sm text-clay">
          {error}
        </p>
      ) : null}

      <section className="rounded border border-ink/10 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">{loan.borrower_name}</h2>
          <StatusBadge status={loan.status} />
        </div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-ink/60">Person who shared this</dt>
            <dd className="font-semibold">{loan.shared_by}</dd>
          </div>
          <div>
            <dt className="text-ink/60">Amount</dt>
            <dd className="font-semibold">{formatPeso(loan.principal)}</dd>
          </div>
          <div>
            <dt className="text-ink/60">Target date</dt>
            <dd className="font-semibold">{loan.due_date}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-ink/60">What it was for</dt>
            <dd className="font-semibold">{loan.purpose}</dd>
          </div>
          {loan.dispute_reason ? (
            <div className="sm:col-span-2">
              <dt className="text-ink/60">What needs to be corrected?</dt>
              <dd className="font-semibold">{loan.dispute_reason}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <form
        action={submitBorrowerResponse.bind(null, id)}
        className="mt-4 space-y-4 rounded border border-ink/10 bg-white p-4"
      >
        <FormField label="What needs to be corrected?">
          <textarea
            className="focus-ring min-h-24 w-full rounded border border-ink/15 px-3 py-2"
            defaultValue={loan.dispute_reason ?? ""}
            name="dispute_reason"
            placeholder="Example: amount is different, date is wrong, or I do not recognize this record."
          />
        </FormField>
        <div className="flex flex-wrap gap-3">
          <button
            className="focus-ring rounded bg-bay px-4 py-2 font-semibold text-white"
            name="response"
            type="submit"
            value="confirmed"
          >
            Yes, this looks right
          </button>
          <button
            className="focus-ring rounded border border-ink/15 px-4 py-2 font-semibold text-ink"
            name="response"
            type="submit"
            value="disputed"
          >
            Send correction
          </button>
        </div>
      </form>
    </div>
  );
}
