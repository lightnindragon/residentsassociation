"use client";

import { useActionState } from "react";
import { saveEmailTemplateForm } from "@/app/admin/actions/email-templates-admin";
import { Button } from "@/components/ui";

export function EmailTemplateEditForm({
  template,
}: {
  template: { template_key: string; subject: string; body_html: string; body_text: string };
}) {
  const [state, formAction] = useActionState(saveEmailTemplateForm, null);
  return (
    <form action={formAction} className="mt-6 flex max-w-3xl flex-col gap-4">
      <input type="hidden" name="template_key" value={template.template_key} />
      <div>
        <label className="text-sm font-medium">Subject</label>
        <input
          name="subject"
          defaultValue={template.subject}
          className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium">HTML body</label>
        <textarea
          name="body_html"
          rows={12}
          defaultValue={template.body_html}
          className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 font-mono text-xs"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Plain text body</label>
        <textarea
          name="body_text"
          rows={8}
          defaultValue={template.body_text}
          className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 font-mono text-xs"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit">Save template</Button>
    </form>
  );
}
