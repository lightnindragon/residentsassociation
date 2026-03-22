"use client";

import { useActionState } from "react";
import { addCategory } from "@/app/admin/actions/forum";
import { Input, Textarea, Button } from "@/components/ui";

export function AddCategoryForm({
  areas,
}: {
  areas: Array<{ id: string; name: string; slug: string }>;
}) {
  const [state, formAction] = useActionState(addCategory, null);
  return (
    <form action={formAction} className="mt-6 flex max-w-md flex-col gap-4 rounded-lg border border-[var(--color-border)] p-4">
      <h2 className="font-heading text-sm font-semibold">Add category</h2>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Area</label>
        <select
          name="area_id"
          required
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm"
        >
          <option value="">— Select area —</option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} ({a.slug})
            </option>
          ))}
        </select>
      </div>
      <Input label="Name" name="name" required placeholder="General" />
      <Input label="Slug" name="slug" placeholder="general" />
      <Textarea label="Description" name="description" rows={2} />
      <Input
        label="Sort order"
        name="sort_order"
        type="number"
        defaultValue="0"
      />
      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      <Button type="submit">Add category</Button>
    </form>
  );
}
