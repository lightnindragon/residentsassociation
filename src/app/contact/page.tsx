import { ContactForm } from "./ContactForm";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold text-[var(--foreground)]">
        Contact us
      </h1>
      <p className="mt-2 text-[var(--color-muted)]">
        Send a message to the residents association. We’ll get back to you as
        soon as we can.
      </p>
      <ContactForm />
    </div>
  );
}
