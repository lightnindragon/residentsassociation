"use server";

import { getSmtpConfig } from "@/lib/email";
import nodemailer from "nodemailer";

export async function sendTestEmail(): Promise<{ ok: boolean; error?: string }> {
  const config = await getSmtpConfig();
  if (!config) return { ok: false, error: "SMTP not configured" };
  try {
    const transport = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: config.user && config.password ? { user: config.user, pass: config.password } : undefined,
    });
    await transport.sendMail({
      from: config.from_address || config.contact_inbox,
      to: config.contact_inbox,
      subject: "[CGRA] Test email from admin",
      text: "This is a test email from your CGRA admin panel. SMTP is working.",
    });
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Send failed",
    };
  }
}
