"use client";

import { useActionState, useEffect, useRef } from "react";
import { createEvent, updateEvent } from "@/app/admin/actions/events";
import { Input, Button } from "@/components/ui";
import { RichTextEditor } from "@/components/RichTextEditor";
import { BlogImageUpload } from "@/components/BlogImageUpload";
import { toast } from "sonner";

function updateBound(id: string) {
  return (prev: unknown, formData: FormData) => updateEvent(id, prev, formData);
}

export function EventForm({
  authorId,
  event,
}: {
  authorId: string;
  event?: {
    id: string;
    title: string;
    excerpt: string | null;
    body: string;
    external_url: string;
    published_at: string | null;
    cover_image_url: string | null;
  };
}) {
  const isEdit = !!event;
  const [state, formAction] = useActionState(
    isEdit
      ? (prev: unknown, formData: FormData) => updateBound(event!.id)(prev, formData)
      : createEvent,
    null
  );
  const lastStateRef = useRef<typeof state>(null);

  useEffect(() => {
    if (!state || state === lastStateRef.current) return;
    lastStateRef.current = state;

    if (state.ok) {
      toast.success(isEdit ? "Event updated." : "Event created.");
      return;
    }

    if (state.error) {
      toast.error(state.error);
    }
  }, [isEdit, state]);

  return (
    <>
      {state?.ok && (
        <p className="mt-4 rounded-lg bg-[var(--color-primary-muted)] px-3 py-2 text-sm text-[var(--color-primary-hover)]">
          {isEdit ? "Event updated." : "Event created."}
        </p>
      )}
      {state?.error && (
        <p className="mt-4 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {state.error}
        </p>
      )}
      <form action={formAction} className="mt-6 flex max-w-3xl flex-col gap-4">
        <input type="hidden" name="authorId" value={authorId} />
        <Input
          label="Title"
          name="title"
          defaultValue={event?.title}
          required
          placeholder="e.g. Summer Community picnic"
        />
        <Input
          label="Event link URL"
          name="external_url"
          defaultValue={event?.external_url ?? ""}
          required
          placeholder="https://…"
        />
        <p className="-mt-2 text-xs text-[var(--color-muted)]">
          Link to tickets, Facebook event, venue page, or further information.
        </p>
        <Input
          label="Excerpt"
          name="excerpt"
          defaultValue={event?.excerpt ?? ""}
          placeholder="Short summary (optional)"
        />
        <BlogImageUpload name="cover_image_url" currentUrl={event?.cover_image_url} />
        <div>
          <span className="mb-1 block text-sm font-medium text-[var(--foreground)]">
            Details (use the toolbar — you won&apos;t see HTML)
          </span>
          <RichTextEditor name="body" initialHtml={event?.body ?? ""} />
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="published"
            value="1"
            defaultChecked={!!event?.published_at}
          />
          <span className="text-sm">Published (visible on site)</span>
        </label>
        <Button type="submit">{isEdit ? "Update" : "Create"}</Button>
      </form>
    </>
  );
}
