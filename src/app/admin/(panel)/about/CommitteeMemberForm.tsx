"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { addCommitteeMember } from "@/app/admin/actions/about";

export function CommitteeMemberForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("role", role.trim());
    formData.append("bio", bio.trim());
    if (file) {
      formData.append("file", file);
    }

    startTransition(async () => {
      const result = await addCommitteeMember(formData);
      if (result.ok) {
        setName("");
        setRole("");
        setBio("");
        setFile(null);
        router.refresh();
      } else {
        setError(result.error ?? "Failed to add.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap items-end gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <div>
        <label className="block text-xs font-medium text-[var(--color-muted)]">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Gill Stott"
          className="mt-0.5 rounded border border-[var(--color-border)] bg-[var(--background)] px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--color-muted)]">Role</label>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. Chair"
          className="mt-0.5 rounded border border-[var(--color-border)] bg-[var(--background)] px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--color-muted)]">Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mt-0.5 block w-full text-sm text-[var(--color-muted)] file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-[var(--color-primary)]/10 file:px-4 file:py-1.5 file:text-sm file:font-semibold file:text-[var(--color-primary)] hover:file:bg-[var(--color-primary)]/20"
        />
      </div>
      <div className="w-full">
        <label className="block text-xs font-medium text-[var(--color-muted)]">About Me (Bio)</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="A short biography..."
          rows={3}
          className="mt-0.5 w-full rounded border border-[var(--color-border)] bg-[var(--background)] px-2 py-1.5 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-[var(--color-primary)] px-3 py-1.5 text-sm text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add member"}
      </button>
      {error && <p className="w-full text-sm text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}
