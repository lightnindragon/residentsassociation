"use server";

import { auth } from "@/lib/auth";
import { getSql } from "@/lib/db";
import DOMPurify from "isomorphic-dompurify";
import { getSmtpConfig } from "@/lib/email";
import nodemailer from "nodemailer";
import { getEmailTemplate, applyTemplate } from "@/lib/email-templates";
import { revalidatePath } from "next/cache";

export async function addPostComment(
  postId: string,
  postSlug: string,
  postTitle: string,
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string; approved?: boolean } | undefined;
  if (!user?.id) return { error: "Sign in to comment." };
  const elevated = user.role === "admin" || user.role === "dev";
  if (!elevated && user.approved === false) return { error: "Your account is not approved yet." };

  const raw = formData.get("body")?.toString() ?? "";
  const body = DOMPurify.sanitize(raw.trim());
  if (!body.replace(/<[^>]+>/g, "").trim()) return { error: "Please write a comment." };

  try {
    const sql = getSql();
    const [row] = await sql`
      INSERT INTO post_comments (post_id, user_id, body)
      VALUES (${postId}::uuid, ${user.id}::uuid, ${body})
      RETURNING id
    `;
    const commentId = (row as { id: string })?.id;
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const link = `${baseUrl}/news/${postSlug}${commentId ? `#comment-${commentId}` : ""}`;
    const config = await getSmtpConfig();
    const tpl = await getEmailTemplate("blog_new_comment");
    if (config?.contact_inbox && tpl) {
      const transport = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.port === 465,
        auth: config.user && config.password ? { user: config.user, pass: config.password } : undefined,
      });
      const plain = body.replace(/<[^>]+>/g, "").slice(0, 500);
      const vars = { title: postTitle, link, body: plain };
      await transport.sendMail({
        from: config.from_address || config.contact_inbox,
        to: config.contact_inbox,
        subject: applyTemplate(tpl.subject, vars),
        text: applyTemplate(tpl.body_text, vars),
        html: applyTemplate(tpl.body_html, vars),
      });
    }
    revalidatePath(`/news/${postSlug}`);
    return null;
  } catch (e) {
    console.error(e);
    return { error: "Could not post comment." };
  }
}
