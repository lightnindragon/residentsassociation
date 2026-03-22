"use client";

import Image from "next/image";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCommitteeMember } from "@/app/admin/actions/about";
import { CommitteeMemberEditForm } from "./CommitteeMemberEditForm";

type Member = {
  id: string;
  name: string;
  role: string;
  image_url: string | null;
  sort_order: number;
};

export function CommitteeMemberList({ members }: { members: Member[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!confirm("Remove this member?")) return;
    startTransition(async () => {
      await deleteCommitteeMember(id);
      router.refresh();
    });
  }

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
        <li
          key={m.id}
          className="flex flex-wrap items-center gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4"
        >
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
          <div className="min-w-0 flex-1">
            <p className="font-medium text-[var(--foreground)]">{m.name}</p>
            <p className="text-sm text-[var(--color-muted)]">{m.role || "—"}</p>
          </div>
          <CommitteeMemberEditForm member={m} />
          <button
            type="button"
            onClick={() => handleDelete(m.id)}
            disabled={pending}
            className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 disabled:opacity-50"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
