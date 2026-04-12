"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { saveHomepageContent } from "@/app/admin/actions/homepage";
import type { HomePageContent } from "@/lib/site-content";
import { ADMIN_HERO_IMAGE_HINT } from "@/lib/image-specs";

export function HomePageContentForm({
  initialContent,
  initialHeroUrl,
}: {
  initialContent: HomePageContent;
  initialHeroUrl: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(saveHomepageContent, null);

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
    }
  }, [state?.ok, router]);

  const showPreview = initialHeroUrl && initialHeroUrl.startsWith("/");

  return (
    <form action={formAction} className="mt-6 max-w-2xl space-y-6">
      <div>
        <h2 className="font-heading text-lg font-semibold text-[var(--foreground)]">Hero Image</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Upload a new image (stored on Vercel Blob) or paste a URL or path (e.g.{" "}
          <code className="rounded bg-[var(--color-border)] px-1">/my-photo.jpg</code> under{" "}
          <code className="rounded bg-[var(--color-border)] px-1">public</code>). Leave the URL empty and
          do not upload to remove the hero image.
        </p>
        <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-500">{ADMIN_HERO_IMAGE_HINT}</p>
        {initialHeroUrl ? (
          <div className="relative mt-3 aspect-[3/1] w-full max-w-xl overflow-hidden rounded-lg border border-[var(--color-border)]">
            {showPreview ? (
              <Image
                src={initialHeroUrl}
                alt=""
                fill
                className="object-cover object-center"
                sizes="(max-width: 576px) 100vw, 576px"
              />
            ) : (
              <img src={initialHeroUrl} alt="" className="h-full w-full object-cover object-center" />
            )}
          </div>
        ) : (
          <p className="mt-2 text-sm text-[var(--color-muted)]">No hero image is set.</p>
        )}
        <label className="mt-3 block text-sm font-medium text-[var(--foreground)]">
          Hero image URL or path
        </label>
        <input
          type="text"
          name="heroUrl"
          key={initialHeroUrl}
          defaultValue={initialHeroUrl}
          placeholder="/images/hero.jpg or https://…"
          className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm"
        />
        <label className="mt-3 block text-sm font-medium text-[var(--foreground)]">
          Replace with file upload
        </label>
        <input
          type="file"
          name="heroFile"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="mt-1 block w-full text-sm text-[var(--color-muted)] file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-[var(--color-primary)]/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--color-primary)] hover:file:bg-[var(--color-primary)]/20"
        />
        <label className="mt-3 block text-sm font-medium text-[var(--foreground)]">
          Hero image alt text (accessibility)
        </label>
        <input
          type="text"
          name="heroAlt"
          defaultValue={initialContent.heroImageAlt}
          className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm"
        />
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold text-[var(--foreground)]">Intro (Under Title)</h2>
        <textarea
          name="intro"
          rows={4}
          defaultValue={initialContent.intro}
          className="mt-2 w-full rounded border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm"
        />
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold text-[var(--foreground)]">Get Involved Section</h2>
        <label className="mt-2 block text-sm font-medium text-[var(--foreground)]">Heading</label>
        <input
          type="text"
          name="getInvolvedTitle"
          defaultValue={initialContent.getInvolvedTitle}
          className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm"
        />
        <label className="mt-3 block text-sm font-medium text-[var(--foreground)]">Subtitle</label>
        <input
          type="text"
          name="getInvolvedSubtitle"
          defaultValue={initialContent.getInvolvedSubtitle}
          className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {state?.ok && <p className="text-sm text-[var(--color-primary)]">Saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save homepage"}
      </button>
    </form>
  );
}
