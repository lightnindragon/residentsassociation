import { signIn } from "@/lib/auth";
import { Input, Button } from "@/components/ui";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; registered?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/";
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-6 py-16">
      <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
        Sign in
      </h1>
      <p className="mt-1 text-[var(--color-muted)]">
        Sign in to access the forum and your account.
      </p>
      {params.registered === "1" && (
        <p className="mt-3 rounded-lg bg-[var(--color-primary-muted)] px-3 py-2 text-sm text-[var(--color-primary)]">
          Registration successful. Please sign in.
        </p>
      )}
      <form
        action={async (formData: FormData) => {
          "use server";
          await signIn("credentials", formData);
        }}
        className="mt-6 flex flex-col gap-4"
      >
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
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
          autoComplete="current-password"
        />
        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-[var(--color-primary)] hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
