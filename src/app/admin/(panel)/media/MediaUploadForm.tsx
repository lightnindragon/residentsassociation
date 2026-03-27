"use client";

import { useActionState } from "react";
import { uploadMediaAsset } from "@/app/admin/actions/media";
import { Input, Button } from "@/components/ui";

export function MediaUploadForm() {
  const [state, formAction] = useActionState(uploadMediaAsset, null);
  return (
    <>
      {state?.error && (
        <p className="mt-4 text-sm text-red-600">{state.error}</p>
      )}
      <form action={formAction} className="mt-6 flex max-w-lg flex-col gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <h3 className="font-heading text-sm font-semibold">Upload new media</h3>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Image file</label>
          <input
            type="file"
            name="file"
            accept="image/*"
            required
            className="block w-full cursor-pointer text-sm text-[var(--color-muted)] file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-[var(--color-primary)]/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--color-primary)] hover:file:bg-[var(--color-primary)]/20"
          />
        </div>
        <Input label="Label (optional)" name="label" placeholder="e.g. Community event banner" />
        <Button type="submit">Upload</Button>
      </form>
    </>
  );
}
