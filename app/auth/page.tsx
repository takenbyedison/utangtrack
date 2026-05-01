import { PageHeading } from "@/components/page-heading";
import { FormField } from "@/components/form-field";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function signUp(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/auth?error=Email%20and%20password%20are%20required.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error || !data.user) {
    redirect(
      `/auth?error=${encodeURIComponent(
        error?.message ?? "Could not create account. Please try again."
      )}`
    );
  }

  if (!data.session) {
    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    if (loginError || !loginData.user) {
      redirect(
        `/auth?error=${encodeURIComponent(
          "Account created. Please confirm your email, then log in."
        )}`
      );
    }
  }

  redirect("/dashboard");
}

async function logIn(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/auth?error=Email%20and%20password%20are%20required.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.user) {
    redirect(
      `/auth?error=${encodeURIComponent(
        error?.message ?? "Could not log in. Please try again."
      )}`
    );
  }

  redirect("/dashboard");
}

export default async function AuthPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-md">
      <PageHeading eyebrow="Secure access" title="Sign in to UtangTrack">
        Use email and password to keep your utang records safe and easy to
        review.
      </PageHeading>

      <form className="space-y-4 rounded border border-ink/10 bg-white p-4">
        {error ? (
          <p className="rounded border border-clay/20 bg-clay/5 px-3 py-2 text-sm text-clay">
            {error}
          </p>
        ) : null}
        <FormField label="Email">
          <input
            className="focus-ring w-full rounded border border-ink/15 px-3 py-2"
            name="email"
            placeholder="maria@example.com"
            required
            type="email"
          />
        </FormField>
        <FormField label="Password">
          <input
            className="focus-ring w-full rounded border border-ink/15 px-3 py-2"
            minLength={6}
            name="password"
            placeholder="At least 8 characters"
            required
            type="password"
          />
        </FormField>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            className="focus-ring rounded bg-bay px-4 py-2 font-semibold text-white"
            formAction={logIn}
            type="submit"
          >
            Log in
          </button>
          <button
            className="focus-ring rounded border border-ink/15 px-4 py-2 font-semibold text-ink"
            formAction={signUp}
            type="submit"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
}
