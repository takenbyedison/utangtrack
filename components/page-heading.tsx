export function PageHeading({
  eyebrow,
  title,
  children
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      {eyebrow ? (
        <p className="mb-1 text-sm font-semibold uppercase text-bay">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
      {children ? <p className="mt-2 max-w-2xl text-ink/70">{children}</p> : null}
    </div>
  );
}
