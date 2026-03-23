"use client";

import { useActionState } from "react";
import { setPasswordFromToken } from "@/app/actions/reset-password";
import { Input, Button } from "@/components/ui";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(setPasswordFromToken, null);

  if (state?.ok) {
    return (
      <div className="mt-8 rounded-lg bg-[var(--color-card)] p-6 text-center shadow-sm border border-[var(--color-border)]">
        <p className="font-medium text-green-600">Password has been reset successfully.</p>
        <div className="mt-4">
          <a href="/login" className="text-sm font-medium text-[var(--color-primary)] hover:underline">
            Go to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-8 space-y-4 rounded-lg bg-[var(--color-card)] p-6 shadow-sm border border-[var(--color-border)]">
      <input type="hidden" name="token" value={token} />
      <Input
        label="New Password"
        name="password"
        type="password"
        required
        minLength={8}
        placeholder="Min 8 characters"
      />
      <Input
        label="Confirm Password"
        name="confirm_password"
        type="password"
        required
        minLength={8}
      />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Saving..." : "Set Password"}
      </Button>
    </form>
  );
}