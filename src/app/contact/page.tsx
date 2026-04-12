import { isTurnstileEnforced } from "@/lib/turnstile";
import { getContactContent } from "@/lib/site-content";
import { getPublicContactEmail } from "@/lib/email";
import { ContactForm } from "./ContactForm";

export default async function ContactPage() {
  const [content, contactEmail] = await Promise.all([
    getContactContent(),
    getPublicContactEmail(),
  ]);
  const turnstileRequired = isTurnstileEnforced();

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold text-[var(--foreground)]">
        {content.title}
      </h1>
      <p className="mt-2 text-[var(--color-muted)]">
        {content.description}
      </p>
      {contactEmail && (
        <p className="mt-4 text-sm text-[var(--foreground)]">
          <span className="text-[var(--color-muted)]">Email: </span>
          <a
            href={`mailto:${contactEmail}`}
            className="font-medium text-[var(--color-primary)] hover:underline"
          >
            {contactEmail}
          </a>
        </p>
      )}
      <ContactForm labels={content} turnstileRequired={turnstileRequired} />
    </div>
  );
}
