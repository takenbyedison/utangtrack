import Link from "next/link";
import { ShieldCheck, UserCheck, Bell } from "lucide-react";

const principles = [
  {
    icon: ShieldCheck,
    title: "Private by default",
    text: "Loan records stay with the lender account. There is no public debtor search, blacklist, or score."
  },
  {
    icon: UserCheck,
    title: "Borrower can respond",
    text: "Each loan can be shared for confirmation, dispute, or correction before both sides rely on it."
  },
  {
    icon: Bell,
    title: "Gentle reminders",
    text: "This MVP only records mock reminders. SMS and email integrations can come later."
  }
];

export default function LandingPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
      <section className="py-8">
        <p className="mb-3 text-sm font-semibold uppercase text-bay">
          Private loan tracking for the Philippines
        </p>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight text-ink sm:text-5xl">
          Track utang clearly without turning people into a public list.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink/72">
          UtangTrack helps lenders record private peer-to-peer loans, invite
          borrowers to confirm or dispute details, track payments, and prepare
          reminder notes.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/auth"
            className="focus-ring rounded bg-bay px-4 py-2 font-semibold text-white"
          >
            Register or login
          </Link>
          <Link
            href="/dashboard"
            className="focus-ring rounded border border-ink/15 px-4 py-2 font-semibold text-ink"
          >
            View demo dashboard
          </Link>
        </div>
      </section>

      <section className="rounded border border-ink/10 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">MVP safety boundaries</h2>
        <ul className="mt-4 space-y-3 text-sm text-ink/75">
          <li>Loan records are visible only to the lender who created them.</li>
          <li>Borrowers can confirm or dispute an invited loan.</li>
          <li>No public credit score, blacklist, or searchable debt history.</li>
          <li>Reminder sending is mocked until SMS/email consent is designed.</li>
        </ul>
      </section>

      <section className="grid gap-3 lg:col-span-2 sm:grid-cols-3">
        {principles.map((item) => (
          <div key={item.title} className="rounded border border-ink/10 bg-white p-4">
            <item.icon className="mb-3 h-5 w-5 text-bay" aria-hidden="true" />
            <h2 className="font-semibold">{item.title}</h2>
            <p className="mt-1 text-sm text-ink/70">{item.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
