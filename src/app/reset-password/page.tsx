import { getSql } from "@/lib/db";
import { notFound } from "next/navigation";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata = {
  title: "Reset Password",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) return notFound();

  try {
    const sql = getSql();
    const rows = await sql`
      SELECT id, email FROM users 
      WHERE password_reset_token = ${token} 
        AND password_reset_expires > NOW() 
      LIMIT 1
    `;
    
    if (!rows || rows.length === 0) {
      return (
        <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
          <h1 className="font-heading text-3xl font-semibold">Invalid Or Expired Token</h1>
          <p className="mt-4 text-[var(--color-muted)]">
            The password reset link you clicked is invalid or has expired. Please request a new one.
          </p>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-md px-4 py-24 sm:px-6">
        <h1 className="text-center font-heading text-3xl font-semibold">Set New Password</h1>
        <p className="mt-2 text-center text-sm text-[var(--color-muted)]">
          Enter a new password for {rows[0].email}
        </p>
        <ResetPasswordForm token={token} />
      </div>
    );
  } catch {
    return notFound();
  }
}