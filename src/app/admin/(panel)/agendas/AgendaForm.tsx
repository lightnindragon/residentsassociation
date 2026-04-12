"use client";

import { useActionState, useEffect, useRef } from "react";
import { createAgenda, updateAgenda } from "@/app/admin/actions/agendas";
import { Input, Button } from "@/components/ui";
import { RichTextEditor } from "@/components/RichTextEditor";
import { BlogImageUpload } from "@/components/BlogImageUpload";
import { toast } from "sonner";

function updateBound(id: string) {
  return (prev: unknown, formData: FormData) => updateAgenda(id, prev, formData);
}

export function AgendaForm({
  authorId,
  agenda,
}: {
  authorId: string;
  agenda?: {
    id: string;
    title: string;
    excerpt: string | null;
    body: string;
    external_url: string;
    published_at: string | null;
    cover_image_url: string | null;
  };
}) {
  const isEdit = !!agenda;
  const [state, formAction] = useActionState(
    isEdit ? (prev: unknown, formData: FormData) => updateBound(agenda!.id)(prev, formData) : createAgenda,
    null
  );
  const lastStateRef = useRef<typeof state>(null);

  useEffect(() => {
    if (!state || state === lastStateRef.current) return;
    lastStateRef.current = state;

    if (state.ok) {
      toast.success(isEdit ? "Agenda updated." : "Agenda created.");
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
          {isEdit ? "Agenda updated." : "Agenda created."}
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
          defaultValue={agenda?.title}
          required
          placeholder="e.g. Committee meeting — March 2026"
        />
        <Input
          label="Agenda link URL"
          name="external_url"
          defaultValue={agenda?.external_url ?? ""}
          required
          placeholder="https://…"
        />
        <p className="-mt-2 text-xs text-[var(--color-muted)]">
          Link to PDF, shared document, or page where the agenda is published.
        </p>
        <Input
          label="Excerpt"
          name="excerpt"
          defaultValue={agenda?.excerpt ?? ""}
          placeholder="Short summary (optional)"
        />
        <BlogImageUpload name="cover_image_url" currentUrl={agenda?.cover_image_url} />
        <div>
          <span className="mb-1 block text-sm font-medium text-[var(--foreground)]">
            Details (use the toolbar — you won&apos;t see HTML)
          </span>
          <RichTextEditor name="body" initialHtml={agenda?.body ?? ""} />
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="published"
            value="1"
            defaultChecked={!!agenda?.published_at}
          />
          <span className="text-sm">Published (visible on site)</span>
        </label>
        <Button type="submit">{isEdit ? "Update" : "Create"}</Button>
      </form>
    </>
  );
}
