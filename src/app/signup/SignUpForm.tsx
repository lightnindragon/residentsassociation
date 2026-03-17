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
      router.push("/login?registered=1");
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
        <Button type="submit" className="w-full">
          Sign up
        </Button>
      </form>
    </>
  );
}
