"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useActionState, useEffect, useRef } from "react";
import { submitContact } from "@/app/actions/contact";
import { Input, Textarea, Button } from "@/components/ui";
import type { ContactContent } from "@/lib/site-content";

const turnstileSiteKey =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";

export function ContactForm({
  labels,
  turnstileRequired,
}: {
  labels: ContactContent;
  turnstileRequired: boolean;
}) {
  const [state, formAction] = useActionState(submitContact, null);
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  useEffect(() => {
    if (state?.success) {
      turnstileRef.current?.reset();
    }
  }, [state?.success]);

  if (turnstileRequired && !turnstileSiteKey) {
    return (
      <p className="mt-8 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
        The contact form is not available right now (human verification is
        enabled on the server but the site key is missing). Please ask the site
        administrator to set{" "}
        <code className="rounded bg-black/5 px-1 dark:bg-white/10">
          NEXT_PUBLIC_TURNSTILE_SITE_KEY
        </code>{" "}
        in the deployment environment.
      </p>
    );
  }

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
        {turnstileSiteKey ? (
          <div className="min-h-[65px]">
            <Turnstile
              ref={turnstileRef}
              siteKey={turnstileSiteKey}
              options={{
                action: "contact",
                theme: "auto",
                size: "normal",
              }}
            />
            <p className="mt-2 text-xs text-[var(--foreground)]/70">
              Tick the box above to show you are a person, not a bot.
            </p>
          </div>
        ) : null}
        <Button type="submit" className="w-full">
          {labels.labelSubmit}
        </Button>
      </form>
    </>
  );
}
