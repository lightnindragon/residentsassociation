"use server";

import { getSql } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function setPasswordFromToken(
  prevState: any,
  formData: FormData
): Promise<{ ok: boolean; error?: string } | null> {
  const token = formData.get("token")?.toString();
  const password = formData.get("password")?.toString();
  const confirmPassword = formData.get("confirm_password")?.toString();

  if (!token || !password || !confirmPassword) {
    return { ok: false, error: "All fields are required." };
  }

  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters long." };
  }

  if (password !== confirmPassword) {
    return { ok: false, error: "Passwords do not match." };
  }

  try {
    const sql = getSql();
    
    // Verify token is still valid
    const rows = await sql`
      SELECT id FROM users 
      WHERE password_reset_token = ${token} 
        AND password_reset_expires > NOW() 
      LIMIT 1
    `;
    
    if (!rows || rows.length === 0) {
      return { ok: false, error: "Invalid or expired token." };
    }

    const userId = rows[0].id;
    const hash = await bcrypt.hash(password, 12);

    // Update password and clear token
    await sql`
      UPDATE users 
      SET password_hash = ${hash}, 
          password_reset_token = NULL, 
          password_reset_expires = NULL,
          updated_at = NOW()
      WHERE id = ${userId}::uuid
    `;

    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "An error occurred while resetting your password." };
  }
}