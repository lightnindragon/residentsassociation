"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { createPage, updatePage } from "@/app/admin/actions/pages";
import { Button, Input } from "@/components/ui";
import { RichTextEditor } from "@/components/RichTextEditor";
import { BlogImageUpload } from "@/components/BlogImageUpload";
import { useOnceFormSubmit } from "@/components/PublishNotifyFields";
import { toast } from "sonner";

function updateBound(id: string) {
  return (prev: unknown, formData: FormData) => updatePage(id, prev, formData);
}

export function PageForm({
  authorId,
  page,
  alreadyInDesktop,
  alreadyInMobile,
}: {
  authorId: string;
  page?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    body: string;
    published_at: string | null;
    cover_image_url: string | null;
  };
  alreadyInDesktop?: boolean;
  alreadyInMobile?: boolean;
}) {
  const isEdit = !!page;
  const [state, formAction] = useActionState(
    isEdit
      ? (prev: unknown, formData: FormData) => updateBound(page!.id)(prev, formData)
      : createPage,
    null
  );
  const lastStateRef = useRef<typeof state>(null);

  useEffect(() => {
    if (!state || state === lastStateRef.current) return;
    lastStateRef.current = state;
    if (state.error) toast.error(state.error);
    else if (state.ok) toast.success(isEdit ? "Page updated." : "Page created.");
  }, [isEdit, state]);

  const onSubmit = useOnceFormSubmit({ error: state?.error, unlock: isEdit && !!state?.ok });
  const publicPath = state?.slug ? `/${state.slug}` : page ? `/${page.slug}` : null;

  return (
    <>
      {state?.ok && (
        <p className="mt-4 rounded-lg bg-[var(--color-primary-muted)] px-3 py-2 text-sm text-[var(--color-primary-hover)]">
          {isEdit ? "Page updated." : "Page created."}
          {publicPath && (
            <>
              {" "}
              <Link href={publicPath} className="font-medium underline" target="_blank">
                View page
              </Link>
            </>
          )}
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
          defaultValue={page?.title}
          required
          placeholder="e.g. Village Fair"
        />
        <Input
          label="Page URL"
          name="slug"
          defaultValue={page?.slug ?? ""}
          placeholder="village-fair"
        />
        <p className="-mt-2 text-xs text-[var(--color-muted)]">
          Optional. This becomes cagra.co.uk/your-url. Leave blank to generate from the title.
        </p>
        <Input
          label="Excerpt"
          name="excerpt"
          defaultValue={page?.excerpt ?? ""}
          placeholder="Short summary (optional)"
        />
        <BlogImageUpload name="cover_image_url" currentUrl={page?.cover_image_url} />
        <div>
          <span className="mb-1 block text-sm font-medium text-[var(--foreground)]">
            Page content
          </span>
          <RichTextEditor name="body" initialHtml={page?.body ?? ""} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" value="1" defaultChecked={!isEdit || !!page?.published_at} />
          Published
        </label>
        <div className="rounded-lg border border-[var(--color-border)] p-3">
          <p className="text-sm font-medium text-[var(--foreground)]">Header menu</p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Add this page to the public header. You can also do this later under Header Menus.
          </p>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input type="checkbox" name="add_desktop" value="1" defaultChecked={!isEdit} />
            Add to desktop menu
            {alreadyInDesktop && (
              <span className="text-xs text-[var(--color-muted)]">(already added)</span>
            )}
          </label>
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input type="checkbox" name="add_mobile" value="1" defaultChecked={!isEdit} />
            Add to mobile menu
            {alreadyInMobile && (
              <span className="text-xs text-[var(--color-muted)]">(already added)</span>
            )}
          </label>
        </div>
        <Button type="submit">{isEdit ? "Update page" : "Create page"}</Button>
      </form>
    </>
  );
}
