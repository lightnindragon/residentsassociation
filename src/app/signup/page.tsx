import Link from "next/link";
import { SignUpForm } from "./SignUpForm";

export default function SignUpPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-6 py-16">
      <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
        Create an account
      </h1>
      <p className="mt-1 text-[var(--color-muted)]">
        Join to access the residents forum and community updates.
      </p>
      <SignUpForm />
      <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[var(--color-primary)] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
