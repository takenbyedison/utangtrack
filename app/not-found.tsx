import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md rounded border border-ink/10 bg-white p-4">
      <h1 className="text-xl font-bold">Record not found</h1>
      <p className="mt-2 text-ink/70">
        This demo only includes a few placeholder loan records.
      </p>
      <Link className="mt-4 inline-block rounded bg-bay px-4 py-2 font-semibold text-white" href="/dashboard">
        Back to dashboard
      </Link>
    </div>
  );
}
