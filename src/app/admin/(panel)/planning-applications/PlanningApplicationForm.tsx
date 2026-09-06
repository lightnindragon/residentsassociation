"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createPlanningApplication,
  updatePlanningApplication,
} from "@/app/admin/actions/planning";
import { Input } from "@/components/ui";
import { RichTextEditor } from "@/components/RichTextEditor";
import { BlogImageUpload } from "@/components/BlogImageUpload";
import { PublishNotifyFields, toastPublishResult, useOnceFormSubmit } from "@/components/PublishNotifyFields";

function updateBound(id: string) {
  return (prev: unknown, formData: FormData) => updatePlanningApplication(id, prev, formData);
}

export function PlanningApplicationForm({
  authorId,
  application,
}: {
  authorId: string;
  application?: {
    id: string;
    title: string;
    excerpt: string | null;
    body: string;
    external_url: string;
    published_at: string | null;
    cover_image_url: string | null;
    subscribers_notified_at?: string | null;
  };
}) {
  const isEdit = !!application;
  const [state, formAction] = useActionState(
    isEdit
      ? (prev: unknown, formData: FormData) => updateBound(application!.id)(prev, formData)
      : createPlanningApplication,
    null
  );
  const lastStateRef = useRef<typeof state>(null);

  useEffect(() => {
    if (!state || state === lastStateRef.current) return;
    lastStateRef.current = state;

    toastPublishResult(
      state,
      isEdit ? "Planning application updated." : "Planning application created."
    );
  }, [isEdit, state]);

  const onSubmit = useOnceFormSubmit({ error: state?.error, unlock: isEdit && !!state?.ok });

  return (
    <>
      {state?.ok && (
        <p className="mt-4 rounded-lg bg-[var(--color-primary-muted)] px-3 py-2 text-sm text-[var(--color-primary-hover)]">
          {isEdit ? "Application updated." : "Application created."}
        </p>
      )}
      {state?.error && (
        <p className="mt-4 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {state.error}
        </p>
      )}
      <form action={formAction} onSubmit={onSubmit} className="mt-6 flex max-w-3xl flex-col gap-4">
        <input type="hidden" name="authorId" value={authorId} />
        <Input
          label="Title"
          name="title"
          defaultValue={application?.title}
          required
          placeholder="e.g. Application at Main Street"
        />
        <Input
          label="Planning portal URL"
          name="external_url"
          defaultValue={application?.external_url ?? ""}
          required
          placeholder="https://…"
        />
        <p className="-mt-2 text-xs text-[var(--color-muted)]">
          Link to the council or planning website entry for this application.
        </p>
        <Input
          label="Excerpt"
          name="excerpt"
          defaultValue={application?.excerpt ?? ""}
          placeholder="Short summary (optional)"
        />
        <BlogImageUpload name="cover_image_url" currentUrl={application?.cover_image_url} />
        <div>
          <span className="mb-1 block text-sm font-medium text-[var(--foreground)]">
            Details (use the toolbar — you won&apos;t see HTML)
          </span>
          <RichTextEditor name="body" initialHtml={application?.body ?? ""} />
        </div>
        <PublishNotifyFields
          defaultPublished={!!application?.published_at}
          notifiedAt={application?.subscribers_notified_at}
          submitLabel={isEdit ? "Update" : "Create"}
          sendKind="planning"
          sendId={application?.id}
          sentNotice={
            state?.ok && (typeof state.sent === "number" || state.alreadySent)
              ? { sent: state.sent, alreadySent: state.alreadySent }
              : null
          }
          saveComplete={!!state?.ok && !isEdit}
        />
      </form>
    </>
  );
}
