"use client";

import { deleteMinutesEntry } from "@/app/admin/actions/minutes";

export function DeleteMinutesButton({ entryId }: { entryId: string }) {
  return (
    <form
      action={async () => {
        if (typeof window !== "undefined" && !confirm("Delete this minutes entry?")) return;
        await deleteMinutesEntry(entryId);
      }}
      className="inline"
    >
      <button type="submit" className="text-red-600 hover:underline dark:text-red-400">
        Delete
      </button>
    </form>
  );
}
