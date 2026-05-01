import Link from "next/link";
import { FormField } from "@/components/form-field";
import { PageHeading } from "@/components/page-heading";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type BorrowerOption = {
  id: string;
  full_name: string;
};

async function createLoan(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth?error=Please%20log%20in%20before%20creating%20a%20loan.");
  }

  const borrowerId = String(formData.get("borrower_id") ?? "").trim();
  const principalText = String(formData.get("principal") ?? "").trim();
  const dueDate = String(formData.get("due_date") ?? "").trim();
  const purpose = String(formData.get("purpose") ?? "").trim();
  const principal = Number(principalText);

  if (!borrowerId || !principalText || !dueDate || !purpose) {
    redirect(
      `/loans/new?error=${encodeURIComponent("All loan fields are required.")}`
    );
  }

  if (!Number.isFinite(principal) || principal <= 0) {
    redirect(
      `/loans/new?error=${encodeURIComponent(
        "Principal amount must be greater than zero."
      )}`
    );
  }

  const { data: borrower, error: borrowerError } = await supabase
    .from("borrowers")
    .select("id")
    .eq("id", borrowerId)
    .eq("lender_id", user.id)
    .single();

  if (borrowerError || !borrower) {
    redirect(
      `/loans/new?error=${encodeURIComponent(
        "Please choose one of your saved borrowers."
      )}`
    );
  }

  const { error } = await supabase.from("loans").insert({
    lender_id: user.id,
    borrower_id: borrowerId,
    principal,
    balance: principal,
    due_date: dueDate,
    purpose,
    status: "pending confirmation"
  });

  if (error) {
    redirect(
      `/loans/new?error=${encodeURIComponent(
        "Could not save loan. Please try again."
      )}`
    );
  }

  redirect("/dashboard");
}

export default async function NewLoanPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth?error=Please%20log%20in%20before%20creating%20a%20loan.");
  }

  const { data: borrowers, error: borrowersError } = await supabase
    .from("borrowers")
    .select("id, full_name")
    .eq("lender_id", user.id)
    .order("full_name", { ascending: true });

  const borrowerOptions = (borrowers ?? []) as BorrowerOption[];
  const formError = error ?? (borrowersError ? "Could not load borrowers." : null);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeading eyebrow="Loan record" title="Create loan record">
        The borrower should be invited to confirm or dispute this loan before it
        is treated as agreed.
      </PageHeading>

      <form
        action={createLoan}
        className="space-y-4 rounded border border-ink/10 bg-white p-4"
      >
        {formError ? (
          <p className="rounded border border-clay/20 bg-clay/5 px-3 py-2 text-sm text-clay">
            {formError}
          </p>
        ) : null}

        {borrowerOptions.length === 0 ? (
          <p className="rounded border border-mango/30 bg-mango/10 px-3 py-2 text-sm text-ink">
            Add a borrower before creating a loan.{" "}
            <Link className="font-semibold text-bay" href="/borrowers/new">
              Create borrower
            </Link>
          </p>
        ) : null}

        <FormField label="Borrower">
          <select
            className="focus-ring w-full rounded border border-ink/15 px-3 py-2"
            defaultValue=""
            disabled={borrowerOptions.length === 0}
            name="borrower_id"
            required
          >
            <option value="" disabled>
              Select borrower
            </option>
            {borrowerOptions.map((borrower) => (
              <option key={borrower.id} value={borrower.id}>
                {borrower.full_name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Principal amount">
          <input
            className="focus-ring w-full rounded border border-ink/15 px-3 py-2"
            min="1"
            name="principal"
            placeholder="5000"
            required
            step="0.01"
            type="number"
          />
        </FormField>

        <FormField label="Due date">
          <input
            className="focus-ring w-full rounded border border-ink/15 px-3 py-2"
            name="due_date"
            required
            type="date"
          />
        </FormField>

        <FormField label="Purpose or memo">
          <textarea
            className="focus-ring min-h-24 w-full rounded border border-ink/15 px-3 py-2"
            name="purpose"
            placeholder="Short, factual loan description."
            required
          />
        </FormField>

        <button
          className="focus-ring rounded bg-bay px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={borrowerOptions.length === 0}
          type="submit"
        >
          Save and create confirmation invite
        </button>
      </form>
    </div>
  );
}
