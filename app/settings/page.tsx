import { PageHeading } from "@/components/page-heading";

export default function SettingsPage() {
  return (
    <div>
      <PageHeading eyebrow="Settings" title="Your settings">
        Control how your records, emails, and reminders work.
      </PageHeading>

      <section className="rounded border border-ink/10 bg-white p-4 text-sm text-ink/70">
        More controls will be added here soon.
      </section>
    </div>
  );
}
