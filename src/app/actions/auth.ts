"use server";

import bcrypt from "bcryptjs";
import { getSql } from "@/lib/db";

export type SignUpResult = { error?: string; pendingApproval?: boolean } | null;

export async function signUp(
  _prev: SignUpResult,
  formData: FormData
): Promise<SignUpResult> {
  const email = formData.get("email")?.toString()?.trim()?.toLowerCase();
  const password = formData.get("password")?.toString();
  const name = formData.get("name")?.toString()?.trim();

  if (!email || !password || !name) {
    return { error: "Email, name and password are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  try {
    const sql = getSql();
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `;
    if (existing.length > 0) {
      return { error: "An account with this email already exists." };
    }
    const notifyBlog = formData.get("notify_new_blog") === "1";
    const password_hash = await bcrypt.hash(password, 12);
    await sql`
      INSERT INTO users (email, password_hash, name, role, approved, notify_new_blog)
      VALUES (${email}, ${password_hash}, ${name}, 'user', false, ${notifyBlog})
    `;
    return { pendingApproval: true };
  } catch (e) {
    console.error(e);
    return { error: "Something went wrong. Please try again." };
  }
}
