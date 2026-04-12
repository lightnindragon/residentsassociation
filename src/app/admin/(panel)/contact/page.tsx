import { getContactContent } from "@/lib/site-content";
import { ContactPageForm } from "./ContactPageForm";

export const dynamic = "force-dynamic";

export default async function AdminContactPage() {
  const content = await getContactContent();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
        Contact Page
      </h1>
      <p className="mt-1 text-[var(--color-muted)]">
        Edit the Contact page heading, description, and form field labels.
      </p>
      <ContactPageForm initial={content} />
    </div>
  );
}
