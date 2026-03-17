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
        <label className="block text-sm font-medium">
          Image file
          <input
            type="file"
            name="file"
            accept="image/*"
            required
            className="mt-1 block w-full text-sm"
          />
        </label>
        <Input label="Caption" name="caption" placeholder="Optional caption" />
        <Button type="submit">Upload</Button>
      </form>
    </>
  );
}
