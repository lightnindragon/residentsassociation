"use client";

import { useActionState } from "react";
import { addArea } from "@/app/admin/actions/forum";
import { Input, Textarea, Button } from "@/components/ui";

export function AddAreaForm() {
  const [state, formAction] = useActionState(addArea, null);
  return (
    <form action={formAction} className="mt-6 flex max-w-md flex-col gap-4 rounded-lg border border-[var(--color-border)] p-4">
      <h2 className="font-heading text-sm font-semibold">Add Area</h2>
      <Input label="Name" name="name" required placeholder="General" />
      <Input label="Slug" name="slug" placeholder="general" />
      <Textarea label="Description" name="description" rows={2} />
      <Input label="Sort order" name="sort_order" type="number" defaultValue="0" />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit">Add area</Button>
    </form>
  );
}
