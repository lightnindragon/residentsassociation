"use client";

import { useState, useTransition, useActionState } from "react";
import { updateArea, deleteArea } from "@/app/admin/actions/forum";
import { Input, Button } from "@/components/ui";

type Area = { id: string; name: string; slug: string; description: string | null; sort_order: number };

export function EditAreaRow({ area }: { area: Area }) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePending, startDelete] = useTransition();
  const [state, formAction, pending] = useActionState(updateArea, null);

  function handleDelete() {
    setDeleteError(null);
    startDelete(async () => {
      const result = await deleteArea(area.id);
      if (result?.error) setDeleteError(result.error);
    });
  }

  if (editing) {
    return (
      <li className="rounded-lg border border-[var(--color-primary)]/40 bg-[var(--color-card)] p-4">
        <form
          action={async (fd) => {
            await formAction(fd);
            setEditing(false);
          }}
          className="flex flex-col gap-3"
        >
          <input type="hidden" name="id" value={area.id} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Name" name="name" defaultValue={area.name} required />
            <Input label="Slug" name="slug" defaultValue={area.slug} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Description" name="description" defaultValue={area.description ?? ""} />
            <Input label="Sort order" name="sort_order" type="number" defaultValue={String(area.sort_order)} />
          </div>
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={pending} className="text-sm px-3 py-1.5">
              {pending ? "Saving…" : "Save"}
            </Button>
            <Button type="button" variant="outline" className="text-sm px-3 py-1.5" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <span className="font-semibold text-[var(--foreground)]">{area.name}</span>
        <span className="ml-2 text-sm text-[var(--color-muted)]">/{area.slug}</span>
        {area.description && (
          <span className="ml-2 text-sm text-[var(--color-muted)]">— {area.description}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {deleteError && <span className="text-xs text-red-600">{deleteError}</span>}
        {confirmDelete ? (
          <>
            <span className="text-xs text-[var(--color-muted)]">Delete area?</span>
            <Button
              type="button"
              variant="outline"
              className="px-2 py-1 text-xs text-red-600 border-red-300 hover:bg-red-50"
              onClick={handleDelete}
              disabled={deletePending}
            >
              {deletePending ? "Deleting…" : "Yes, delete"}
            </Button>
            <Button type="button" variant="outline" className="px-2 py-1 text-xs" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button type="button" variant="outline" className="px-2 py-1 text-xs" onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Button
              type="button"
              variant="outline"
              className="px-2 py-1 text-xs text-red-600 border-red-300 hover:bg-red-50"
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </Button>
          </>
        )}
      </div>
    </li>
  );
}
