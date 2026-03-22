import { getContactContent } from "@/lib/site-content";
import { ContactForm } from "./ContactForm";

export default async function ContactPage() {
  const content = await getContactContent();

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold text-[var(--foreground)]">
        {content.title}
      </h1>
      <p className="mt-2 text-[var(--color-muted)]">
        {content.description}
      </p>
      <ContactForm labels={content} />
    </div>
  );
}
