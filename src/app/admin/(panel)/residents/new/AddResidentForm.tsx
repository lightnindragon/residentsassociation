"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input, Button } from "@/components/ui";
import { addResident } from "@/app/admin/actions/residents";

export function AddResidentForm() {
  const router = useRouter();
  const [pending, start] = useTransition();

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await addResident(fd);
      if (res.ok) {
        toast.success("Resident added successfully.");
        router.push("/admin/residents");
        router.refresh();
      } else {
        toast.error(res.error ?? "Failed to add Resident.");
      }
    });
  }

  return (
    <form onSubmit={onSave} className="flex flex-col gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
      <Input label="Name" name="name" required placeholder="Full Name" />
      <Input label="Email" name="email" type="email" required placeholder="Email Address" />
      <Input
        label="Password"
        name="password"
        type="password"
        required
        minLength={8}
        placeholder="Min 8 characters"
      />
      
      <div className="border-t border-[var(--color-border)] pt-4 mt-2">
        <h3 className="font-medium text-sm mb-3">Optional Details</h3>
        <div className="flex flex-col gap-4">
          <Input label="Forum display name" name="forum_username" placeholder="Optional" />
          <Input label="Forum town" name="forum_town" placeholder="Optional" />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">Full Address</label>
            <textarea
              name="address"
              rows={3}
              className="rounded-md border border-[var(--color-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
              placeholder="Optional address details"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">Admin Notes</label>
            <textarea
              name="admin_notes"
              rows={3}
              className="rounded-md border border-[var(--color-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
              placeholder="Internal notes only"
            />
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-2">
        <input type="checkbox" id="approved" name="approved" value="1" defaultChecked className="rounded border-gray-300" />
        <label htmlFor="approved" className="text-sm">Auto-approve this user</label>
      </div>

      <div className="mt-4 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/residents")} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Adding…" : "Add Resident"}
        </Button>
      </div>
    </form>
  );
}