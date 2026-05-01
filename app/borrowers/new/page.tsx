import { FormField } from "@/components/form-field";
import { PageHeading } from "@/components/page-heading";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function createBorrower(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(
      `/borrowers/new?error=${encodeURIComponent(
        "Please log in before saving a borrower."
      )}`
    );
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!fullName) {
    redirect(
      `/borrowers/new?error=${encodeURIComponent("Full name is required.")}`
    );
  }

  const { error } = await supabase.from("borrowers").insert({
    lender_id: user.id,
    full_name: fullName,
    phone: phone || null,
    email: email || null,
    notes: notes || null
  });

  if (error) {
    redirect(
      `/borrowers/new?error=${encodeURIComponent(
        "Could not save borrower. Please try again."
      )}`
    );
  }

  redirect("/dashboard");
}

export default async function NewBorrowerPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeading eyebrow="Borrower profile" title="Create borrower profile">
        Save only the contact details needed to invite the borrower and track
        private loans between you.
      </PageHeading>

      <form
        action={createBorrower}
        className="space-y-4 rounded border border-ink/10 bg-white p-4"
      >
        {error ? (
          <p className="rounded border border-clay/20 bg-clay/5 px-3 py-2 text-sm text-clay">
            {error}
          </p>
        ) : null}

        <FormField label="Full name">
          <input
            className="focus-ring w-full rounded border border-ink/15 px-3 py-2"
            name="full_name"
            placeholder="Juan Dela Cruz"
            required
          />
        </FormField>

        <FormField label="Mobile number">
          <input
            className="focus-ring w-full rounded border border-ink/15 px-3 py-2"
            name="phone"
            placeholder="+63 917 123 4567"
          />
        </FormField>

        <FormField label="Email">
          <input
            className="focus-ring w-full rounded border border-ink/15 px-3 py-2"
            name="email"
            placeholder="juan@example.com"
            type="email"
          />
        </FormField>

        <FormField label="Private notes">
          <textarea
            className="focus-ring min-h-24 w-full rounded border border-ink/15 px-3 py-2"
            name="notes"
            placeholder="How you know this borrower, preferred payment method, or consent notes."
          />
        </FormField>

        <button
          className="focus-ring rounded bg-bay px-4 py-2 font-semibold text-white"
          type="submit"
        >
          Save borrower
        </button>
      </form>
    </div>
  );
}
