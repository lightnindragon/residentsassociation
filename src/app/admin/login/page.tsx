import { signIn } from "@/lib/auth";
import { Input, Button } from "@/components/ui";
import Link from "next/link";
import { redirect, unstable_rethrow } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role === "admin" || user?.role === "dev") {
    redirect("/admin");
  }
  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-6 py-16">
      <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
        Admin sign in
      </h1>
      <p className="mt-1 text-[var(--color-muted)]">
        Committee and site administrators only.
      </p>
      {params.error === "CredentialsSignin" && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          Invalid email or password, or this account is not an administrator.
        </p>
      )}
      <form
        action={async (formData: FormData) => {
          "use server";
          const { auth } = await import("@/lib/auth");
          try {
            await signIn("credentials", {
              email: formData.get("email"),
              password: formData.get("password"),
              redirectTo: "/admin",
            });
            const session = await auth();
            const role = (session?.user as { role?: string })?.role;
            if (role === "admin" || role === "dev") {
              redirect("/admin");
            } else {
              redirect("/");
            }
          } catch (error) {
            unstable_rethrow(error);
            redirect("/admin/login?error=CredentialsSignin");
          }
        }}
        className="mt-6 flex flex-col gap-4"
      >
        <Input
          label="Email"
          name="email"
          type="email"
          required
          placeholder="admin@example.com"
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
          Sign in to admin
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
        <Link href="/" className="text-[var(--color-primary)] hover:underline">
          Back to site
        </Link>
        {" · "}
        <Link href="/login" className="text-[var(--color-primary)] hover:underline">
          Resident login
        </Link>
      </p>
    </div>
  );
}
