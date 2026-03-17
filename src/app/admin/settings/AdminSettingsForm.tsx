"use client";

import { useActionState, useTransition, useState } from "react";
import { saveSmtpConfig } from "@/app/admin/actions/settings";
import { sendTestEmail } from "@/app/admin/actions/email-test";
import { Input, Button } from "@/components/ui";

type Initial = {
  host: string;
  port: number;
  user: string;
  from_address: string;
  contact_inbox: string;
} | null;

export function AdminSettingsForm({ initial }: { initial: Initial }) {
  const [state, formAction] = useActionState(saveSmtpConfig, null);
  const [isTesting, startTest] = useTransition();
  const [testResult, setTestResult] = useState<{
    ok?: boolean;
    error?: string;
  } | null>(null);

  return (
    <>
      {state?.ok && (
        <p className="mt-4 rounded-lg bg-green-100 px-3 py-2 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-400">
          Settings saved.
        </p>
      )}
      {state?.error && (
        <p className="mt-4 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {state.error}
        </p>
      )}
      {testResult && (
        <p
          className={`mt-4 rounded-lg px-3 py-2 text-sm ${
            testResult.ok
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {testResult.ok ? "Test email sent." : testResult.error}
        </p>
      )}
      <form action={formAction} className="mt-6 flex max-w-md flex-col gap-4">
        <Input
          label="SMTP host"
          name="host"
          type="text"
          defaultValue={initial?.host}
          placeholder="smtp.example.com"
        />
        <Input
          label="SMTP port"
          name="port"
          type="number"
          defaultValue={initial?.port ?? 587}
          placeholder="587"
        />
        <Input
          label="SMTP user"
          name="user"
          type="text"
          defaultValue={initial?.user}
          placeholder="user@example.com"
        />
        <Input
          label="SMTP password"
          name="password"
          type="password"
          placeholder={initial ? "Leave blank to keep current" : "Required"}
          autoComplete="new-password"
        />
        <Input
          label="From address"
          name="from_address"
          type="email"
          defaultValue={initial?.from_address}
          placeholder="noreply@yourdomain.org"
        />
        <Input
          label="Contact inbox (Proton Mail)"
          name="contact_inbox"
          type="email"
          defaultValue={initial?.contact_inbox}
          placeholder="contact@protonmail.com"
          required
        />
        <div className="flex gap-3">
          <Button type="submit">Save</Button>
          <Button
            type="button"
            variant="outline"
            disabled={isTesting}
            onClick={() => {
              setTestResult(null);
              startTest(async () => {
                const res = await sendTestEmail();
                setTestResult(res);
              });
            }}
          >
            {isTesting ? "Sending…" : "Send test email"}
          </Button>
        </div>
      </form>
    </>
  );
}

