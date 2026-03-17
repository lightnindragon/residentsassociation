"use client";

import { deleteImage } from "@/app/admin/actions/gallery";

export function DeleteButton({ imageId }: { imageId: string }) {
  return (
    <form
      action={async () => {
        if (typeof window !== "undefined" && !confirm("Delete this image?")) return;
        await deleteImage(imageId);
      }}
      className="inline"
    >
      <button
        type="submit"
        className="text-xs text-red-600 hover:underline dark:text-red-400"
      >
        Delete
      </button>
    </form>
  );
}
