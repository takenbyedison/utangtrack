import { notFound, redirect } from "next/navigation";
import { FormField } from "@/components/form-field";
import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/server";
import type { LoanStatus } from "@/lib/types";

type ConfirmationLoan = {
  loan_id: string;
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
        "Please enter a dispute reason."
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

  redirect(`/confirm/${token}?saved=1`);
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
      <PageHeading eyebrow="Borrower confirmation" title="Confirm or dispute loan">
        This private invite page is for the borrower only. It does not publish a
        debt record or create a credit score.
      </PageHeading>

      {saved ? (
        <p className="mb-4 rounded border border-bay/20 bg-bay/5 px-3 py-2 text-sm text-bay">
          Your response has been saved.
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
            <dt className="text-ink/60">Amount</dt>
            <dd className="font-semibold">{formatPeso(loan.principal)}</dd>
          </div>
          <div>
            <dt className="text-ink/60">Due date</dt>
            <dd className="font-semibold">{loan.due_date}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-ink/60">Purpose or memo</dt>
            <dd className="font-semibold">{loan.purpose}</dd>
          </div>
          {loan.dispute_reason ? (
            <div className="sm:col-span-2">
              <dt className="text-ink/60">Dispute reason</dt>
              <dd className="font-semibold">{loan.dispute_reason}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <form
        action={submitBorrowerResponse.bind(null, id)}
        className="mt-4 space-y-4 rounded border border-ink/10 bg-white p-4"
      >
        <FormField label="Response">
          <select
            className="focus-ring w-full rounded border border-ink/15 px-3 py-2"
            defaultValue={loan.borrower_response ?? ""}
            name="response"
            required
          >
            <option value="" disabled>
              Select response
            </option>
            <option value="confirmed">Confirm loan</option>
            <option value="disputed">Dispute loan</option>
          </select>
        </FormField>
        <FormField label="Dispute reason or note">
          <textarea
            className="focus-ring min-h-24 w-full rounded border border-ink/15 px-3 py-2"
            defaultValue={loan.dispute_reason ?? ""}
            name="dispute_reason"
            placeholder="Required if disputing. Example: amount, date, or purpose is incorrect."
          />
        </FormField>
        <button
          className="focus-ring rounded bg-bay px-4 py-2 font-semibold text-white"
          type="submit"
        >
          Submit response
        </button>
      </form>
    </div>
  );
}
