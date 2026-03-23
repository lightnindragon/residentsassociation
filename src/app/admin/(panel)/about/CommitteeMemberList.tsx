"use client";

import Image from "next/image";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCommitteeMember, updateCommitteeMember } from "@/app/admin/actions/about";

type Member = {
  id: string;
  name: string;
  role: string;
  image_url: string | null;
  sort_order: number;
};

function CommitteeMemberItem({ m }: { m: Member }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(m.name);
  const [role, setRole] = useState(m.role);
  const [file, setFile] = useState<File | null>(null);

  function handleDelete(id: string) {
    if (!confirm("Remove this member?")) return;
    startTransition(async () => {
      await deleteCommitteeMember(id);
      router.refresh();
    });
  }

  function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("id", m.id);
    formData.append("name", name);
    formData.append("role", role);
    if (file) {
      formData.append("file", file);
    }

    startTransition(async () => {
      const result = await updateCommitteeMember(formData);
      if (result.ok) {
        setEditing(false);
        setFile(null);
        router.refresh();
      }
    });
  }

  return (
    <li className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-[var(--color-border)]">
        {m.image_url ? (
          <Image
            src={m.image_url}
            alt={m.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-2xl text-[var(--color-muted)]">
            ?
          </span>
        )}
      </div>

      {!editing ? (
        <>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-[var(--foreground)]">{m.name}</p>
            <p className="text-sm text-[var(--color-muted)]">{m.role || "—"}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-muted)]/10"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => handleDelete(m.id)}
              disabled={pending}
              className="rounded border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleUpdate} className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="w-full rounded border border-[var(--color-border)] bg-[var(--background)] px-2 py-1.5 text-sm"
              />
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Role"
                className="w-full rounded border border-[var(--color-border)] bg-[var(--background)] px-2 py-1.5 text-sm"
              />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-[var(--color-muted)] file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-[var(--color-primary)]/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--color-primary)] hover:file:bg-[var(--color-primary)]/20"
            />
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:flex-col">
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setName(m.name);
                setRole(m.role);
                setFile(null);
              }}
              disabled={pending}
              className="w-full rounded border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-muted)]/10 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </li>
  );
}

export function CommitteeMemberList({ members }: { members: Member[] }) {
  if (members.length === 0) {
    return (
      <p className="mt-3 text-sm text-[var(--color-muted)]">
        No committee members yet. Add one above.
      </p>
    );
  }

  return (
    <ul className="mt-4 space-y-4">
      {members.map((m) => (
        <CommitteeMemberItem key={m.id} m={m} />
      ))}
    </ul>
  );
}
