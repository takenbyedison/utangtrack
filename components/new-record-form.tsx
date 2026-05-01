"use client";

import { useState } from "react";
import Link from "next/link";
import { FormField } from "@/components/form-field";

type PersonOption = {
  id: string;
  full_name: string;
};

export function NewRecordForm({
  people,
  formError
}: {
  people: PersonOption[];
  formError: string | null;
}) {
  const [selectedPerson, setSelectedPerson] = useState("");
  const isAddingNew = selectedPerson === "__new__";

  return (
    <>
      {formError ? (
        <p className="rounded border border-clay/20 bg-clay/5 px-3 py-2 text-sm text-clay">
          {formError}
        </p>
      ) : null}

      {people.length === 0 ? (
        <p className="rounded border border-mango/30 bg-mango/10 px-3 py-2 text-sm text-ink">
          Add someone here, or create a profile first.{" "}
          <Link className="font-semibold text-bay" href="/borrowers/new">
            Add someone
          </Link>
        </p>
      ) : null}

      <FormField label="Person">
        <select
          className="focus-ring w-full rounded border border-ink/15 px-3 py-2"
          name="borrower_id"
          onChange={(event) => setSelectedPerson(event.target.value)}
          required
          value={selectedPerson}
        >
          <option value="" disabled>
            Select person
          </option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.full_name}
            </option>
          ))}
          <option value="__new__">+ Add someone new</option>
        </select>
      </FormField>

      {isAddingNew ? (
        <div className="rounded border border-bay/15 bg-mint p-4">
          <h2 className="font-semibold text-moss">Add someone new</h2>
          <div className="mt-4 grid gap-4">
            <FormField label="Full name">
              <input
                className="focus-ring w-full rounded border border-ink/15 px-3 py-2"
                name="new_full_name"
                placeholder="Juan Dela Cruz"
                required={isAddingNew}
              />
            </FormField>
            <FormField label="Mobile number">
              <input
                className="focus-ring w-full rounded border border-ink/15 px-3 py-2"
                name="new_phone"
                placeholder="+63 917 123 4567"
              />
            </FormField>
            <FormField label="Email">
              <input
                className="focus-ring w-full rounded border border-ink/15 px-3 py-2"
                name="new_email"
                placeholder="juan@example.com"
                type="email"
              />
            </FormField>
            <FormField label="Private note">
              <textarea
                className="focus-ring min-h-20 w-full rounded border border-ink/15 px-3 py-2"
                name="new_notes"
                placeholder="Anything useful for your own records."
              />
            </FormField>
          </div>
        </div>
      ) : null}

      <FormField label="Amount you gave">
        <input
          className="focus-ring w-full rounded border border-ink/15 px-3 py-2"
          min="1"
          name="principal"
          placeholder="5000"
          required
          step="0.01"
          type="number"
        />
      </FormField>

      <FormField label="Target date">
        <input
          className="focus-ring w-full rounded border border-ink/15 px-3 py-2"
          name="due_date"
          required
          type="date"
        />
      </FormField>

      <FormField label="What was it for?">
        <textarea
          className="focus-ring min-h-24 w-full rounded border border-ink/15 px-3 py-2"
          name="purpose"
          placeholder="Example: emergency help, groceries, rent support, dinner, bills"
          required
        />
      </FormField>

    </>
  );
}
