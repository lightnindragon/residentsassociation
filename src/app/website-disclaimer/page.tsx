import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Website disclaimer",
  description:
    "How CAGRA presents information on this website, limits of liability, external links, and community content.",
};

export default function WebsiteDisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-2xl font-semibold leading-snug text-[var(--foreground)] sm:text-3xl">
        Website disclaimer &ndash; Culcheth &amp; Glazebury Residents&rsquo; Association (CAGRA)
      </h1>
      <hr className="mt-6 border-[var(--color-surface-strong)]" />
      <div className="prose mt-8 max-w-none text-[var(--foreground)] [&_h2]:font-heading [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:leading-relaxed [&_p+p]:mt-4">
        <h2>About the information we share</h2>
        <p>
          CAGRA provides information on this website to help keep residents informed about local
          issues, events, and community matters. We aim to ensure everything is accurate and current,
          but we cannot guarantee that all content is complete, error-free, or up to date at all
          times.
        </p>

        <h2>No legal or professional advice</h2>
        <p>
          Nothing on this website should be taken as legal, financial, or professional advice. Any
          decisions you make based on the information here are your own responsibility.
        </p>

        <h2>Liability</h2>
        <p>
          CAGRA accepts no liability for any loss, damage, or inconvenience caused as a result of
          using this website or relying on its content. All information is provided in good faith
          for general community awareness.
        </p>

        <h2>External links</h2>
        <p>
          Our website may include links to other websites or sources of information. We do not
          control these sites and are not responsible for their content, accuracy, or privacy
          practices.
        </p>

        <h2>Community-submitted content</h2>
        <p>
          Where residents contribute information, comments, or suggestions, this content reflects
          their views and experiences. CAGRA is not responsible for the accuracy of
          community-submitted material.
        </p>

        <h2>Updates and changes</h2>
        <p>
          We may update or change website content at any time without notice. If you spot something
          that looks incorrect, please let us know so we can review it.
        </p>

        <h2>Contact us</h2>
        <p>
          If you have questions about this disclaimer or wish to report an issue, please contact us
          via the details on our{" "}
          <Link href="/contact" className="underline underline-offset-2">
            Contact page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
