import Link from "next/link";
import { PageHeading } from "@/components/page-heading";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type PaymentRow = {
  id: string;
  loan_id: string;
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

export default async function PaymentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth?error=Please%20log%20in%20to%20view%20payments.");
  }

  const { data, error } = await supabase
    .from("payments")
    .select("id, loan_id, amount, paid_at, note")
    .eq("lender_id", user.id)
    .order("paid_at", { ascending: false })
    .limit(25);

  const payments = (data ?? []) as PaymentRow[];

  return (
    <div>
      <PageHeading eyebrow="Payments" title="Money returned to you">
        A simple history of payments you’ve recorded.
      </PageHeading>

      {error ? (
        <p className="mb-4 rounded border border-clay/20 bg-clay/5 px-3 py-2 text-sm text-clay">
          Could not load payments. Please refresh and try again.
        </p>
      ) : null}

      <section className="overflow-hidden rounded border border-ink/10 bg-white">
        <div className="border-b border-ink/10 px-4 py-3">
          <h2 className="font-semibold">Recent payments</h2>
        </div>
        <div className="divide-y divide-ink/10">
          {payments.length > 0 ? (
            payments.map((payment) => (
              <Link
                className="focus-ring block p-4 hover:bg-mint"
                href={`/loans/${payment.loan_id}`}
                key={payment.id}
              >
                <p className="font-semibold">{formatPeso(payment.amount)}</p>
                <p className="mt-1 text-sm text-ink/65">
                  {payment.paid_at}
                  {payment.note ? ` - ${payment.note}` : ""}
                </p>
              </Link>
            ))
          ) : (
            <p className="p-4 text-sm text-ink/70">
              No payments recorded yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
