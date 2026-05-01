import Link from "next/link";
import { ShieldCheck, UserCheck, Bell } from "lucide-react";

const principles = [
  {
    icon: ShieldCheck,
    title: "Private by default",
    text: "Your records stay with you. No one else can search or see them."
  },
  {
    icon: UserCheck,
    title: "Shared clarity",
    text: "Send a simple link so the other person can confirm or correct the details."
  },
  {
    icon: Bell,
    title: "No-pressure follow-ups",
    text: "Track payments quietly and follow up when the time is right."
  }
];

export default function LandingPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
      <section className="py-8">
        <p className="mb-3 text-sm font-semibold uppercase text-bay">
          Utang tracking for real life
        </p>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight text-ink sm:text-5xl">
          Track utang without awkwardness.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink/72">
          Keep things clear between you and the people you trust. No public
          lists. No pressure. Just shared understanding.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/auth"
            className="focus-ring rounded bg-bay px-4 py-2 font-semibold text-white"
          >
            Start tracking
          </Link>
          <Link
            href="/dashboard"
            className="focus-ring rounded border border-ink/15 px-4 py-2 font-semibold text-ink"
          >
            Open your dashboard
          </Link>
        </div>
      </section>

      <section className="rounded border border-ink/10 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Built for real-life situations</h2>
        <ul className="mt-4 space-y-3 text-sm text-ink/75">
          <li>Only you can see your records.</li>
          <li>The other person can confirm or correct the details.</li>
          <li>No public lists, no shaming.</li>
          <li>You stay in control of what you track.</li>
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
