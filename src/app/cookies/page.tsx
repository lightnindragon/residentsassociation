export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold text-[var(--foreground)]">
        Cookie Policy
      </h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Last updated: 27 March 2026
      </p>
      <div className="prose mt-8 max-w-none text-[var(--foreground)] [&_h2]:font-heading [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:leading-relaxed [&_p+p]:mt-4 [&_ul]:mt-3 [&_ul]:space-y-2 [&_li]:leading-relaxed">
        <p>
          This Cookie Policy explains what cookies are, how the Culcheth &amp;
          Glazebury Residents Association (&ldquo;we&rdquo;, &ldquo;us&rdquo;,
          &ldquo;our&rdquo;) uses them on this website (<strong>cagra.co.uk</strong>),
          and your choices regarding cookies.
        </p>

        <h2>1. What Are Cookies?</h2>
        <p>
          Cookies are small text files that are placed on your device (computer,
          phone or tablet) when you visit a website. They are widely used to make
          websites work efficiently and to provide information to the site owners.
        </p>

        <h2>2. Cookies We Use</h2>
        <p>
          We only use cookies that are <strong>strictly necessary</strong> for the
          site to function. We do not use any advertising, analytics or tracking
          cookies.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="py-2 pr-4 text-left font-semibold">Cookie name</th>
                <th className="py-2 pr-4 text-left font-semibold">Purpose</th>
                <th className="py-2 pr-4 text-left font-semibold">Duration</th>
                <th className="py-2 text-left font-semibold">Type</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-muted)]">
              <tr className="border-b border-[var(--color-border)]">
                <td className="py-2 pr-4 font-mono text-xs">authjs.session-token</td>
                <td className="py-2 pr-4">Keeps you signed in after logging in. Required for the forum, account area and admin panel to work.</td>
                <td className="py-2 pr-4">30 days</td>
                <td className="py-2">Essential</td>
              </tr>
              <tr className="border-b border-[var(--color-border)]">
                <td className="py-2 pr-4 font-mono text-xs">authjs.csrf-token</td>
                <td className="py-2 pr-4">Protects against cross-site request forgery (CSRF) attacks when submitting forms.</td>
                <td className="py-2 pr-4">Session</td>
                <td className="py-2">Essential</td>
              </tr>
              <tr className="border-b border-[var(--color-border)]">
                <td className="py-2 pr-4 font-mono text-xs">authjs.callback-url</td>
                <td className="py-2 pr-4">Remembers which page to return you to after signing in.</td>
                <td className="py-2 pr-4">Session</td>
                <td className="py-2">Essential</td>
              </tr>
              <tr className="border-b border-[var(--color-border)]">
                <td className="py-2 pr-4 font-mono text-xs">cf_clearance</td>
                <td className="py-2 pr-4">Set by the human verification check on the contact form. Prevents you from having to verify repeatedly.</td>
                <td className="py-2 pr-4">Up to 30 mins</td>
                <td className="py-2">Essential</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>3. Third-Party Cookies</h2>
        <p>
          We do <strong>not</strong> use any third-party advertising or analytics
          cookies. The only third-party cookie that may be set is by the human
          verification service used on the contact form. This cookie is strictly
          functional and is used solely to prevent spam.
        </p>

        <h2>4. Managing Cookies</h2>
        <p>
          Since we only use essential cookies, there is no cookie consent banner
          on this site &mdash; essential cookies are exempt from consent requirements
          under UK cookie law (the Privacy and Electronic Communications
          Regulations 2003).
        </p>
        <p>
          You can still control cookies through your browser settings. Most
          browsers allow you to:
        </p>
        <ul className="list-disc pl-6">
          <li>View what cookies are stored and delete them individually.</li>
          <li>Block all cookies or only third-party cookies.</li>
          <li>Clear all cookies when you close the browser.</li>
        </ul>
        <p>
          Please note that if you block or delete the authentication cookies, you
          will not be able to sign in to your account, use the forum, or access
          the admin panel.
        </p>
        <p>
          Here are links to cookie management instructions for common browsers:
        </p>
        <ul className="list-disc pl-6">
          <li>
            <a href="https://support.google.com/chrome/answer/95647" className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">
              Google Chrome
            </a>
          </li>
          <li>
            <a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">
              Mozilla Firefox
            </a>
          </li>
          <li>
            <a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">
              Safari
            </a>
          </li>
          <li>
            <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">
              Microsoft Edge
            </a>
          </li>
        </ul>

        <h2>5. Changes To This Policy</h2>
        <p>
          We may update this Cookie Policy from time to time. The &ldquo;Last
          updated&rdquo; date at the top of this page will be revised accordingly.
          If we start using any new types of cookies, we will update this page
          before doing so.
        </p>

        <h2>6. More Information</h2>
        <p>
          For more details on how we handle your personal data, please see our{" "}
          <a href="/privacy" className="underline underline-offset-2">
            Privacy Policy
          </a>
          . If you have any questions about our use of cookies, please get in
          touch via the{" "}
          <a href="/contact" className="underline underline-offset-2">
            Contact page
          </a>
          .
        </p>
      </div>
    </div>
  );
}
