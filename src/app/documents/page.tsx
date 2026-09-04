import {
  getCodeOfConductPdfUrl,
  getConstitutionPdfUrl,
} from "@/lib/site-content";
import { Card, CardHeader, CardContent } from "@/components/ui";
import Link from "next/link";

export default async function DocumentsPage() {
  const [constitutionPdfUrl, codeOfConductPdfUrl] = await Promise.all([
    getConstitutionPdfUrl(),
    getCodeOfConductPdfUrl(),
  ]);

  const items = [
    {
      href: "/agendas",
      title: "Agendas",
      body: "Meeting agendas from the Residents Association.",
    },
    {
      href: "/minutes",
      title: "Minutes",
      body: "Approved meeting minutes.",
    },
    {
      href: constitutionPdfUrl,
      title: "Constitution",
      body: "The formal rules for how the association is run.",
      external: true,
      id: "constitution",
    },
    {
      href: codeOfConductPdfUrl,
      title: "Code of conduct",
      body: "Expectations for committee members.",
      external: true,
      id: "code-of-conduct",
    },
  ] as const;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-10 border-l-4 border-[var(--color-primary)] pl-4">
        <h1 className="font-heading text-3xl font-semibold text-[var(--foreground)]">
          Documents
        </h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Agendas, minutes, and key association documents.
        </p>
      </div>
      <div className="flex flex-col gap-6">
        {items.map((item) => (
          <Link
            key={item.title}
            id={"id" in item ? item.id : undefined}
            href={item.href}
            className="scroll-mt-28"
            {...("external" in item && item.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            <Card className="border-t-[3px] border-t-[var(--color-primary)] transition-all hover:-translate-y-0.5 hover:shadow-md">
              <CardHeader>{item.title}</CardHeader>
              <CardContent>{item.body}</CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}