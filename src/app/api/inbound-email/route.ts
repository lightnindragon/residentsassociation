import { NextRequest, NextResponse } from "next/server";
import { addResidentReplyByEmail } from "@/app/actions/enquiries";

/**
 * Inbound email webhook: when a Resident replies via email, the provider (SendGrid
 * Inbound Parse, Mailgun, etc.) POSTs here. Body can be JSON or form depending on provider.
 * Expects: messageId (uuid), from (email), body (text).
 * Optional: Authorization header with INBOUND_EMAIL_SECRET for verification.
 */
export async function POST(req: NextRequest) {
  try {
    const secret = process.env.INBOUND_EMAIL_SECRET;
    if (secret) {
      const auth = req.headers.get("authorization");
      const token = auth?.replace(/^Bearer\s+/i, "") ?? req.nextUrl.searchParams.get("secret");
      if (token !== secret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    let messageId: string;
    let from: string;
    let body: string;

    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const data = await req.json();
      messageId = data.messageId ?? data.message_id;
      from = data.from ?? data.sender ?? data.email;
      body = data.body ?? data.text ?? data.plain ?? "";
    } else {
      const form = await req.formData();
      messageId = (form.get("messageId") ?? form.get("message_id"))?.toString() ?? "";
      from = (form.get("from") ?? form.get("sender") ?? form.get("email"))?.toString() ?? "";
      body = (form.get("body") ?? form.get("text") ?? form.get("plain"))?.toString() ?? "";
    }

    if (!messageId || !from?.includes("@") || !body?.trim()) {
      return NextResponse.json(
        { error: "Missing messageId, from (email), or body" },
        { status: 400 }
      );
    }

    const result = await addResidentReplyByEmail(messageId, from, body.trim());
    if (!result.ok) {
      return NextResponse.json({ error: result.error ?? "Failed" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Inbound email error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
