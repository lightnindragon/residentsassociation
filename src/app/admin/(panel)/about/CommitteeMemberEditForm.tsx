"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { updateCommitteeMember } from "@/app/admin/actions/about";

type Member = {
  id: string;
  name: string;
  role: string;
  image_url: string | null;
  sort_order: number;
};

export function CommitteeMemberEditForm({ member }: { member: Member }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(member.name);
  const [role, setRole] = useState(member.role);
  const [file, setFile] = useState<File | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateCommitteeMember(member.id, name, role, file ?? undefined);
      if (result.ok) {
        setEditing(false);
        setFile(null);
        router.refresh();
      }
    });
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--foreground)] hover:bg-[var(--color-card)]"
      >
        Edit
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="rounded border border-[var(--color-border)] px-2 py-1 text-sm"
      />
      <input
        type="text"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        placeholder="Role"
        className="rounded border border-[var(--color-border)] px-2 py-1 text-sm"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="text-xs"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-[var(--color-primary)] px-2 py-1 text-xs text-white disabled:opacity-50"
      >
        {pending ? "…" : "Save"}
      </button>
      <button
        type="button"
        onClick={() => { setEditing(false); setName(member.name); setRole(member.role); setFile(null); }}
        className="rounded border border-[var(--color-border)] px-2 py-1 text-xs"
      >
        Cancel
      </button>
    </form>
  );
}
