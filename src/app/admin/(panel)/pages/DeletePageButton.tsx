"use client";

import { deletePage } from "@/app/admin/actions/pages";

export function DeletePageButton({ pageId }: { pageId: string }) {
  return (
    <form
      action={async () => {
        if (typeof window !== "undefined" && !confirm("Delete this page?")) return;
        await deletePage(pageId);
      }}
      className="inline"
    >
      <button type="submit" className="text-red-600 hover:underline dark:text-red-400">
        Delete
      </button>
    </form>
  );
}
