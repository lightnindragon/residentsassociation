"use client";

import { useActionState } from "react";
import { uploadImage } from "@/app/admin/actions/gallery";
import { Input, Button } from "@/components/ui";

export function UploadForm() {
  const [state, formAction] = useActionState(uploadImage, null);
  return (
    <>
      {state?.error && (
        <p className="mt-4 text-sm text-red-600">{state.error}</p>
      )}
      <form action={formAction} className="mt-6 flex max-w-md flex-col gap-4">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Image file</label>
          <input
            type="file"
            name="file"
            accept="image/*"
            required
            className="block w-full cursor-pointer text-sm text-[var(--color-muted)] file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-[var(--color-primary)]/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--color-primary)] hover:file:bg-[var(--color-primary)]/20"
          />
        </div>
        <Input label="Caption" name="caption" placeholder="Optional caption" />
        <Button type="submit">Upload</Button>
      </form>
    </>
  );
}
