"use client";

import { useActionState } from "react";
import { submitContact } from "@/app/actions/contact";
import { Input, Textarea, Button } from "@/components/ui";
import type { ContactContent } from "@/lib/site-content";

export function ContactForm({ labels }: { labels: ContactContent }) {
  const [state, formAction] = useActionState(submitContact, null);

  return (
    <>
      {state?.success && (
        <p className="rounded-lg bg-[var(--color-primary-muted)] px-3 py-2 text-sm text-[var(--color-primary)]">
          Thank you. Your message has been sent.
        </p>
      )}
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {state.error}
        </p>
      )}
      <form action={formAction} className="mt-8 flex flex-col gap-5">
        <Input
          label={labels.labelName}
          name="name"
          type="text"
          required
          placeholder="Jane Smith"
        />
        <Input
          label={labels.labelEmail}
          name="email"
          type="email"
          required
          placeholder="you@example.com"
        />
        <Input
          label={labels.labelSubject}
          name="subject"
          type="text"
          required
          placeholder="Brief subject"
        />
        <Textarea
          label={labels.labelMessage}
          name="body"
          required
          placeholder="Your message..."
          rows={5}
        />
        <Button type="submit" className="w-full">
          {labels.labelSubmit}
        </Button>
      </form>
    </>
  );
}
