"use client";

import { useActionState } from "react";
import { addCategory } from "@/app/admin/actions/forum";
import { Input, Textarea, Button } from "@/components/ui";

export function AddCategoryForm() {
  const [state, formAction] = useActionState(addCategory, null);
  return (
    <form action={formAction} className="mt-6 flex max-w-md flex-col gap-4">
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
