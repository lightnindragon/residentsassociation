"use client";

import { useActionState } from "react";
import { addPostCategory } from "@/app/admin/actions/post-categories";
import { Input, Button } from "@/components/ui";

export function PostCategoryForm() {
  const [state, formAction] = useActionState(addPostCategory, null);
  return (
    <form action={formAction} className="mt-6 flex max-w-md flex-col gap-3">
      <Input label="Name" name="name" required />
      <Input label="Slug" name="slug" placeholder="optional" />
      <Input label="Sort order" name="sort_order" type="number" defaultValue="0" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="show_in_header" value="1" />
        Show in main header (News dropdown)
      </label>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit">Add category</Button>
    </form>
  );
}
