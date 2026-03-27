"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { signUp, type SignUpResult } from "@/app/actions/auth";
import { Input, Button } from "@/components/ui";

export function SignUpForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(async (prev: SignUpResult | null, formData: FormData) => {
    const result = await signUp(prev, formData);
    if (result && !result.error) {
      if (result.pendingApproval) {
        router.push("/login?pending=1");
      } else {
        router.push("/login?registered=1");
      }
      return null;
    }
    return result ?? null;
  }, null);

  return (
    <>
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {state.error}
        </p>
      )}
      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <Input
          label="Name"
          name="name"
          type="text"
          required
          placeholder="Your name"
          autoComplete="name"
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--foreground)]">
            Full Address <span className="text-xs text-[var(--color-muted)] font-normal">(For admin verification only)</span>
          </label>
          <textarea
            name="address"
            required
            rows={3}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
            placeholder="Your full address"
          />
        </div>
        <Input
          label="Email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
        />
        <Input
          label="Password"
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />
        <label className="flex cursor-pointer items-start gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            name="notify_new_blog"
            value="1"
            defaultChecked
            className="mt-1 rounded border-[var(--color-border)]"
          />
          <span>
            Receive news and updates by email{" "}
            <span className="text-[var(--color-muted)]">(untick to opt out)</span>
          </span>
        </label>
        <Button type="submit" className="w-full">
          Sign up
        </Button>
      </form>
    </>
  );
}
