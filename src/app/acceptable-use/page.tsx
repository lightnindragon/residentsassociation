import type { Metadata } from "next";
import Link from "next/link";
import { getCodeOfConductPdfUrl } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Acceptable use policy",
  description:
    "Standards for using the Culcheth & Glazebury Residents' Association website and Facebook.",
};

export default async function AcceptableUsePage() {
  const codeOfConductPdfUrl = await getCodeOfConductPdfUrl();
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold text-[var(--foreground)]">
        Acceptable use policy
      </h1>
      <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
        Culcheth &amp; Glazebury Residents&rsquo; Association
      </p>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        This page reflects the Association&rsquo;s published Acceptable Use Policy for the website
        and Facebook.
      </p>
      <div className="prose mt-8 max-w-none text-[var(--foreground)] [&_h2]:font-heading [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:leading-relaxed [&_p+p]:mt-4 [&_ul]:mt-3 [&_ul]:space-y-2 [&_li]:leading-relaxed">
        <p>
          This Acceptable Use Policy (&ldquo;<strong>AUP</strong>&rdquo;) explains the standards
          expected of anyone using the Culcheth &amp; Glazebury Residents&rsquo; Association website
          (&ldquo;the Website&rdquo;) and Social Media (Facebook). By accessing or using the Website
          or Facebook, you agree to follow these rules.
        </p>
        <p>
          The Website and Facebook site exist to support the community of Culcheth &amp; Glazebury,
          to share information and to reflect the welcoming, respectful character of our villages.
        </p>

        <h2>1. Purpose of the Website and Facebook</h2>
        <p>The Website and Facebook site provides residents with:</p>
        <ul className="list-disc pl-6">
          <li>News and updates about Culcheth &amp; Glazebury</li>
          <li>Information about local events, facilities, and community initiatives</li>
          <li>
            Access to documents, minutes, and notices from the Residents&rsquo; Association
          </li>
          <li>A point of contact for local queries and community engagement</li>
        </ul>
        <p>
          Both the Website and Facebook site are intended to be safe, friendly and constructive
          spaces for all residents.
        </p>

        <h2>2. Acceptable use</h2>
        <p>You may use the Website and Facebook to:</p>
        <ul className="list-disc pl-6">
          <li>Read and share information relevant to Culcheth &amp; Glazebury</li>
          <li>Contact the Residents&rsquo; Association</li>
          <li>Participate in community discussions (where appropriate)</li>
          <li>Access documents and resources provided for residents</li>
        </ul>
        <p>Your use must always be respectful and considerate of others in the community.</p>

        <h2>3. Unacceptable use</h2>
        <p>You must not use the Website or Facebook site:</p>
        <ul className="list-disc pl-6">
          <li>
            For unlawful or harmful activity, including harassment, fraud, or behaviour that
            breaches UK law
          </li>
          <li>
            To post or share offensive, abusive, defamatory, discriminatory, or threatening
            material or information
          </li>
          <li>To spread misinformation or rumours about individuals, groups, or local matters</li>
          <li>
            To upload harmful content, including viruses, malware, or code intended to disrupt
            systems
          </li>
          <li>To infringe copyright, privacy, or intellectual property rights</li>
          <li>To impersonate another person, including members of the Association</li>
          <li>To send spam, advertising, or unsolicited messages</li>
          <li>To attempt to gain unauthorised access to the Website or its systems</li>
          <li>To harm or exploit children, or share content unsuitable for minors</li>
        </ul>
        <p>
          Any behaviour that undermines the spirit of Culcheth &amp; Glazebury Residents&rsquo;
          Association will not be tolerated.
        </p>

        <h2>4. User-generated content</h2>
        <p>Where the Website and Facebook allow comments, submissions, or uploads:</p>
        <ul className="list-disc pl-6">
          <li>Content must be respectful, factual, and relevant to Culcheth &amp; Glazebury</li>
          <li>Personal data about others must not be shared without consent</li>
          <li>Content must not mislead or cause unnecessary alarm within the community</li>
          <li>
            The Association may remove any content that breaches this Policy or is considered
            inappropriate.
          </li>
        </ul>

        <h2>5. Security</h2>
        <p>Users must not:</p>
        <ul className="list-disc pl-6">
          <li>Attempt to bypass or disable security features</li>
          <li>Interfere with the proper functioning of the Website</li>
          <li>Use automated tools (such as bots or scrapers) without permission</li>
        </ul>
        <p>
          The Association takes reasonable steps to maintain security, but users are responsible
          for protecting their own devices.
        </p>

        <h2>6. Privacy and data protection</h2>
        <p>
          Any personal information you provide will be handled in line with the Association&rsquo;s{" "}
          <Link href="/privacy" className="underline underline-offset-2">
            Privacy Policy
          </Link>{" "}
          and in accordance with UK data protection law.
        </p>
        <p>You must not misuse any personal data accessed through the Website.</p>

        <h2>7. Monitoring and moderation</h2>
        <p>
          The Association may monitor Website activity to ensure compliance with this Policy.
          Content may be edited or removed where necessary to protect the community.
        </p>

        <h2>8. Breach of this policy</h2>
        <p>If you breach this Policy, the Association may:</p>
        <ul className="list-disc pl-6">
          <li>Remove or edit your content</li>
          <li>Restrict or block your access to the Website and Facebook</li>
          <li>Report unlawful behaviour to the appropriate authorities</li>
          <li>Take any other action considered appropriate.</li>
        </ul>

        <h2>9. Links to other policies</h2>
        <p>This Policy should be read alongside:</p>
        <ul className="list-disc pl-6">
          <li>
            <a
              href={codeOfConductPdfUrl}
              className="underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Code of Conduct
            </a>{" "}
            (PDF)
          </li>
          <li>
            <Link href="/privacy" className="underline underline-offset-2">
              Privacy Policy
            </Link>
          </li>
        </ul>

        <h2>10. Changes to this policy</h2>
        <p>
          The Association may update this Policy from time to time. Continued use of the Website
          and Facebook means you accept any changes.
        </p>
      </div>
    </div>
  );
}
