import { NewRecordForm } from "@/components/new-record-form";
import { PageHeading } from "@/components/page-heading";
import { sendConfirmationEmail } from "@/lib/invite-email";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type PersonOption = {
  id: string;
  full_name: string;
};

type PersonForInvite = {
  id: string;
  full_name: string;
  email: string | null;
};

type CreatedRecord = {
  id: string;
  confirmation_token: string;
};

async function createRecord(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth?error=Please%20log%20in%20before%20adding%20a%20record.");
  }

  const selectedPersonId = String(formData.get("borrower_id") ?? "").trim();
  const amountText = String(formData.get("principal") ?? "").trim();
  const dueDate = String(formData.get("due_date") ?? "").trim();
  const purpose = String(formData.get("purpose") ?? "").trim();
  const amount = Number(amountText);

  if (!selectedPersonId || !amountText || !dueDate || !purpose) {
    redirect(
      `/loans/new?error=${encodeURIComponent("All record fields are required.")}`
    );
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    redirect(
      `/loans/new?error=${encodeURIComponent(
        "Amount must be greater than zero."
      )}`
    );
  }

  let person: PersonForInvite | null = null;

  if (selectedPersonId === "__new__") {
    const fullName = String(formData.get("new_full_name") ?? "").trim();
    const phone = String(formData.get("new_phone") ?? "").trim();
    const email = String(formData.get("new_email") ?? "").trim();
    const notes = String(formData.get("new_notes") ?? "").trim();

    if (!fullName) {
      redirect(
        `/loans/new?error=${encodeURIComponent(
          "Full name is required when adding someone new."
        )}`
      );
    }

    const { data, error } = await supabase
      .from("borrowers")
      .insert({
        lender_id: user.id,
        full_name: fullName,
        phone: phone || null,
        email: email || null,
        notes: notes || null
      })
      .select("id, full_name, email")
      .single();

    if (error || !data) {
      redirect(
        `/loans/new?error=${encodeURIComponent(
          "Could not save this person. Please try again."
        )}`
      );
    }

    person = data as PersonForInvite;
  } else {
    const { data, error } = await supabase
      .from("borrowers")
      .select("id, full_name, email")
      .eq("id", selectedPersonId)
      .eq("lender_id", user.id)
      .single();

    if (error || !data) {
      redirect(
        `/loans/new?error=${encodeURIComponent(
          "Please choose someone from your saved people."
        )}`
      );
    }

    person = data as PersonForInvite;
  }

  const { data: record, error: recordError } = await supabase
    .from("loans")
    .insert({
      lender_id: user.id,
      borrower_id: person.id,
      principal: amount,
      balance: amount,
      due_date: dueDate,
      purpose,
      status: "pending confirmation"
    })
    .select("id, confirmation_token")
    .single();

  if (recordError || !record) {
    redirect(
      `/loans/new?error=${encodeURIComponent(
        "Could not save this record. Please try again."
      )}`
    );
  }

  const savedRecord = record as CreatedRecord;

  if (!person.email) {
    redirect(
      `/loans/${savedRecord.id}?invite_error=${encodeURIComponent(
        "Record saved. Add an email to send a confirmation request."
      )}`
    );
  }

  const emailResult = await sendConfirmationEmail({
    loanId: savedRecord.id,
    to: person.email,
    personName: person.full_name,
    purpose,
    amount: formatPeso(amount),
    targetDate: dueDate,
    confirmationToken: savedRecord.confirmation_token
  });

  if (!emailResult.ok) {
    redirect(
      `/loans/${savedRecord.id}?invite_error=${encodeURIComponent(
        "Record saved, but the confirmation email could not be sent. You can resend it from this page."
      )}`
    );
  }

  redirect(
    `/loans/${savedRecord.id}?invite_success=${encodeURIComponent(
      "Confirmation email sent."
    )}`
  );
}

function formatPeso(amount: number | string) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0
  }).format(Number(amount));
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
    redirect("/auth?error=Please%20log%20in%20before%20adding%20a%20record.");
  }

  const { data: people, error: peopleError } = await supabase
    .from("borrowers")
    .select("id, full_name")
    .eq("lender_id", user.id)
    .order("full_name", { ascending: true });

  const personOptions = (people ?? []) as PersonOption[];
  const formError = error ?? (peopleError ? "Could not load people." : null);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeading eyebrow="New record" title="Add a money record">
        Write down what was shared, then send it for confirmation so both sides
        are clear.
      </PageHeading>

      <form
        action={createRecord}
        className="space-y-4 rounded border border-ink/10 bg-white p-4"
      >
        <NewRecordForm formError={formError} people={personOptions} />

        <button
          className="focus-ring rounded bg-bay px-4 py-2 font-semibold text-white"
          type="submit"
        >
          Save and send for confirmation
        </button>
        <p className="text-sm text-ink/65">
          The other person can confirm or correct this record before you track
          payments.
        </p>
      </form>
    </div>
  );
}
