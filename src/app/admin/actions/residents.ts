"use server";

import { getSql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { applyTemplate, getEmailTemplate } from "@/lib/email-templates";
import { getSmtpConfig } from "@/lib/email";
import nodemailer from "nodemailer";

async function requireAdminRole() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "admin" && role !== "dev") throw new Error("Forbidden");
}

export async function addResident(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdminRole();
    const email = formData.get("email")?.toString()?.trim()?.toLowerCase();
    const password = formData.get("password")?.toString();
    const name = formData.get("name")?.toString()?.trim();
    const forum_username = formData.get("forum_username")?.toString()?.trim() || null;
    const forum_town = formData.get("forum_town")?.toString()?.trim() || null;
    const address = formData.get("address")?.toString()?.trim() || null;
    const admin_notes = formData.get("admin_notes")?.toString()?.trim() || null;
    const approved = formData.get("approved") === "1";

    if (!email || !password || !name) {
      return { ok: false, error: "Name, email and password are required." };
    }
    if (password.length < 8) {
      return { ok: false, error: "Password must be at least 8 characters." };
    }

    const sql = getSql();
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `;
    if (existing.length > 0) {
      return { ok: false, error: "An account with this email already exists." };
    }

    const password_hash = await bcrypt.hash(password, 12);
    
    await sql`
      INSERT INTO users (
        email, password_hash, name, role, approved, 
        forum_username, forum_town, address, admin_notes
      )
      VALUES (
        ${email}, ${password_hash}, ${name}, 'user', ${approved}, 
        ${forum_username}, ${forum_town}, ${address}, ${admin_notes}
      )
    `;
    
    revalidatePath("/admin/residents");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Failed to add Resident." };
  }
}

export async function setUserBanned(userId: string, banned: boolean, bannedUntil?: Date | null): Promise<{ ok: boolean }> {
  try {
    await requireAdminRole();
    const sql = getSql();
    await sql`UPDATE users SET banned = ${banned}, banned_until = ${bannedUntil || null}, updated_at = NOW() WHERE id = ${userId}::uuid AND role = 'user'`;
    revalidatePath("/forum");
    revalidatePath("/admin/residents");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function triggerPasswordReset(userId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdminRole();
    const sql = getSql();
    const [u] = await sql`SELECT email, name FROM users WHERE id = ${userId}::uuid LIMIT 1`;
    if (!u) return { ok: false, error: "User not found" };

    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    await sql`
      UPDATE users 
      SET password_reset_token = ${token}, password_reset_expires = ${expires}
      WHERE id = ${userId}::uuid
    `;

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;
    
    const config = await getSmtpConfig();
    if (config) {
      const transport = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.port === 465,
        auth: config.user && config.password ? { user: config.user, pass: config.password } : undefined,
      });
      await transport.sendMail({
        from: config.from_address || config.contact_inbox,
        to: u.email as string,
        subject: "Password Reset Request",
        text: `Hi ${u.name},\n\nPlease reset your password by clicking the link below:\n${resetUrl}\n\nThis link will expire in 24 hours.`,
        html: `<p>Hi ${u.name},</p><p>Please reset your password by clicking the link below:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link will expire in 24 hours.</p>`,
      });
    }

    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Failed to send email." };
  }
}

export async function approveResident(userId: string): Promise<{ ok: boolean }> {
  try {
    await requireAdminRole();
    const sql = getSql();
    const [u] = await sql`SELECT email, name FROM users WHERE id = ${userId}::uuid AND role = 'user' LIMIT 1`;
    if (!u) return { ok: false };
    await sql`UPDATE users SET approved = true, updated_at = NOW() WHERE id = ${userId}::uuid`;
    const row = u as { email: string; name: string };
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const loginUrl = `${baseUrl}/login`;
    const tpl = await getEmailTemplate("resident_approved");
    const config = await getSmtpConfig();
    if (config && tpl) {
      const transport = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.port === 465,
        auth: config.user && config.password ? { user: config.user, pass: config.password } : undefined,
      });
      const vars = { name: row.name, loginUrl };
      await transport.sendMail({
        from: config.from_address || config.contact_inbox,
        to: row.email,
        subject: applyTemplate(tpl.subject, vars),
        text: applyTemplate(tpl.body_text, vars),
        html: applyTemplate(tpl.body_html, vars),
      });
    }
    revalidatePath("/admin/residents");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false };
  }
}

export async function updateResident(
  userId: string,
  data: { name: string; email: string; forum_username: string; forum_town: string; admin_notes: string; address?: string }
): Promise<{ ok: boolean }> {
  try {
    await requireAdminRole();
    const sql = getSql();
    await sql`
      UPDATE users SET
        name = ${data.name.trim()},
        email = ${data.email.trim().toLowerCase()},
        forum_username = ${data.forum_username.trim() || null},
        forum_town = ${data.forum_town.trim() || null},
        admin_notes = ${data.admin_notes.trim() || null},
        address = ${data.address?.trim() || null},
        updated_at = NOW()
      WHERE id = ${userId}::uuid AND role = 'user'
    `;
    revalidatePath("/admin/residents");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function resetResidentPassword(
  userId: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdminRole();
    if (newPassword.length < 8) return { ok: false, error: "Min 8 characters." };
    const hash = await bcrypt.hash(newPassword, 12);
    const sql = getSql();
    await sql`
      UPDATE users SET password_hash = ${hash}, updated_at = NOW()
      WHERE id = ${userId}::uuid AND role = 'user'
    `;
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed." };
  }
}
