export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold text-[var(--foreground)]">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Last updated: 27 March 2026
      </p>
      <div className="prose mt-8 max-w-none text-[var(--foreground)] [&_h2]:font-heading [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:leading-relaxed [&_p+p]:mt-4 [&_ul]:mt-3 [&_ul]:space-y-2 [&_li]:leading-relaxed">
        <p>
          The Culcheth &amp; Glazebury Residents Association (&ldquo;the
          Association&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;,
          &ldquo;our&rdquo;) is committed to protecting your privacy. This policy
          explains how we collect, use, store and protect your personal information
          when you use this website (<strong>cagra.co.uk</strong>).
        </p>

        <h2>1. Who we are</h2>
        <p>
          We are the Culcheth &amp; Glazebury Residents Association, a voluntary,
          not-for-profit community organisation. We are the data controller for
          the personal information collected through this website. If you have any
          questions about how we handle your data, please contact us via our{" "}
          <a href="/contact" className="underline underline-offset-2">
            Contact page
          </a>
          .
        </p>

        <h2>2. Information we collect</h2>
        <p>We may collect and process the following personal information:</p>
        <ul className="list-disc pl-6">
          <li>
            <strong>Account registration:</strong> Your name, email address and a
            securely hashed password when you create an account.
          </li>
          <li>
            <strong>Contact form submissions:</strong> Your name, email address,
            subject and message when you get in touch.
          </li>
          <li>
            <strong>Forum posts:</strong> Any content you post in the
            residents&rsquo; forum, including text and any images you upload.
          </li>
          <li>
            <strong>Donation information:</strong> If you choose to donate, we do
            not collect payment details through this website. Donations are made
            by bank transfer directly to our account.
          </li>
          <li>
            <strong>Technical data:</strong> Your IP address, browser type, device
            information and pages visited may be collected automatically through
            server logs and hosting infrastructure.
          </li>
        </ul>

        <h2>3. How we use your information</h2>
        <p>We use your personal information to:</p>
        <ul className="list-disc pl-6">
          <li>Operate and maintain the website and your account.</li>
          <li>Respond to messages submitted through the contact form.</li>
          <li>Send administrative notifications (e.g. when a contact message is assigned to a committee member).</li>
          <li>Display your forum posts and contributions on the site.</li>
          <li>Moderate content to maintain community standards.</li>
          <li>Improve the website and understand how it is used.</li>
        </ul>
        <p>
          We do <strong>not</strong> sell, rent or share your personal data with
          third parties for marketing purposes.
        </p>

        <h2>4. Legal basis for processing (UK GDPR)</h2>
        <p>We process your personal data on the following bases:</p>
        <ul className="list-disc pl-6">
          <li>
            <strong>Consent:</strong> When you create an account, submit a contact
            form or post on the forum, you consent to us processing that data for
            the stated purpose.
          </li>
          <li>
            <strong>Legitimate interests:</strong> To operate and improve the
            website, moderate content, and protect against misuse.
          </li>
          <li>
            <strong>Legal obligation:</strong> Where we are required by law to
            retain or disclose information.
          </li>
        </ul>

        <h2>5. Cookies</h2>
        <p>
          We use cookies that are strictly necessary for the operation of the
          site, including session and authentication cookies. These allow you to
          log in and stay signed in while you browse. We do not use advertising
          or tracking cookies.
        </p>
        <p>
          For full details, please see our{" "}
          <a href="/cookies" className="underline underline-offset-2">
            Cookie Policy
          </a>
          .
        </p>

        <h2>6. Contact form verification</h2>
        <p>
          The contact page uses a third-party human verification service to help
          prevent automated spam submissions. This service runs in your browser
          and may process technical data (such as device characteristics and
          network signals) to confirm you are a real person. No personal data is
          shared beyond what is required for the verification check.
        </p>

        <h2>7. Data storage and security</h2>
        <p>
          Your data is stored securely using reputable third-party hosting and
          database providers. Passwords are stored as one-way cryptographic hashes
          and cannot be read by anyone, including administrators.
        </p>
        <p>
          We take reasonable technical and organisational measures to protect your
          data against unauthorised access, loss or destruction. However, no method
          of electronic storage or transmission is 100% secure, and we cannot
          guarantee absolute security.
        </p>

        <h2>8. Data retention</h2>
        <p>
          We retain your personal data for as long as your account is active or as
          needed to provide the services described above. Contact form messages are
          retained for administrative purposes until they are no longer needed. If
          you request account deletion, we will remove your personal data within a
          reasonable timeframe, except where we are required by law to retain it.
        </p>

        <h2>9. Data sharing</h2>
        <p>
          We use reputable third-party service providers for website hosting,
          data storage and spam prevention. These providers process data solely
          on our behalf and in accordance with their own privacy policies.
        </p>
        <p>
          We do not share your personal information with any other third parties
          unless required to do so by law.
        </p>

        <h2>10. Your rights</h2>
        <p>
          Under the UK General Data Protection Regulation (UK GDPR) and the Data
          Protection Act 2018, you have the right to:
        </p>
        <ul className="list-disc pl-6">
          <li><strong>Access</strong> the personal data we hold about you.</li>
          <li><strong>Rectification</strong> &mdash; request correction of inaccurate or incomplete data.</li>
          <li><strong>Erasure</strong> &mdash; request deletion of your personal data (&ldquo;right to be forgotten&rdquo;).</li>
          <li><strong>Restrict processing</strong> of your data in certain circumstances.</li>
          <li><strong>Data portability</strong> &mdash; request a copy of your data in a structured, commonly used format.</li>
          <li><strong>Object</strong> to processing based on legitimate interests.</li>
          <li><strong>Withdraw consent</strong> at any time where processing is based on consent.</li>
        </ul>
        <p>
          To exercise any of these rights, please contact us via the{" "}
          <a href="/contact" className="underline underline-offset-2">
            Contact page
          </a>
          . We will respond within one month of receiving your request.
        </p>

        <h2>11. Children&rsquo;s privacy</h2>
        <p>
          This website is not directed at children under 13. We do not knowingly
          collect personal data from children under 13. If you believe a child has
          provided us with personal information, please contact us and we will
          take steps to remove that data.
        </p>

        <h2>12. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. The &ldquo;Last
          updated&rdquo; date at the top of this page will be revised accordingly.
          Continued use of the site after changes constitutes acceptance of the
          updated policy. We recommend checking this page periodically.
        </p>

        <h2>13. Complaints</h2>
        <p>
          If you are not satisfied with how we handle your personal data, you have
          the right to lodge a complaint with the Information Commissioner&rsquo;s
          Office (ICO):
        </p>
        <ul className="list-disc pl-6">
          <li>
            Website:{" "}
            <a
              href="https://ico.org.uk"
              className="underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              ico.org.uk
            </a>
          </li>
          <li>Helpline: 0303 123 1113</li>
        </ul>

        <h2>14. Contact us</h2>
        <p>
          If you have any questions about this Privacy Policy or how we handle
          your data, please get in touch via our{" "}
          <a href="/contact" className="underline underline-offset-2">
            Contact page
          </a>
          .
        </p>
      </div>
    </div>
  );
}
