import { PageHeading } from "@/components/page-heading";

export default function ActivityPage() {
  return (
    <div>
      <PageHeading eyebrow="Activity" title="What changed recently">
        Updates will appear here when records are confirmed, corrected, emailed,
        or paid.
      </PageHeading>

      <section className="rounded border border-ink/10 bg-white p-4 text-sm text-ink/70">
        No updates yet. Activity will appear here as your records change.
      </section>
    </div>
  );
}
