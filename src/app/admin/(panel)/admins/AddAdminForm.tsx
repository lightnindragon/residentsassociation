"use client";

import { useActionState } from "react";
import { addAdminUser } from "@/app/admin/actions/admins";
import { Input, Button } from "@/components/ui";

export function AddAdminForm() {
  const [state, formAction] = useActionState(addAdminUser, null);
  return (
    <form action={formAction} className="mt-6 flex max-w-md flex-col gap-3">
      <Input label="Name" name="name" required />
      <Input label="Email" name="email" type="email" required />
      <Input label="Password" name="password" type="password" required minLength={10} />
      <div>
        <label className="text-sm font-medium">Role</label>
        <select
          name="role"
          className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm"
        >
          <option value="admin">Admin</option>
          <option value="dev">Dev</option>
        </select>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">Administrator added.</p>}
      <Button type="submit">Add administrator</Button>
    </form>
  );
}
