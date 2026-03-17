export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold text-[var(--foreground)]">
        Terms & Conditions
      </h1>
      <div className="prose mt-8 max-w-none text-[var(--foreground)]">
        <p>
          By using this website you agree to these terms. The Culcheth &
          Glazebury Residents Association (“we”) operates this site for the
          benefit of the community.
        </p>
        <h2 className="font-heading mt-6 text-xl font-medium">Use of the site</h2>
        <p>
          You may use the site for lawful purposes only. You must not post
          content that is defamatory, offensive, or in breach of any law. We
          reserve the right to remove content and restrict access where
          necessary.
        </p>
        <h2 className="font-heading mt-6 text-xl font-medium">Forum and accounts</h2>
        <p>
          If you sign up for an account, you are responsible for keeping your
          details secure. Forum posts and other user-generated content remain
          your responsibility; we may moderate or remove content in line with
          our community standards.
        </p>
        <h2 className="font-heading mt-6 text-xl font-medium">Changes</h2>
        <p>
          We may update these terms from time to time. Continued use of the
          site after changes constitutes acceptance of the updated terms.
        </p>
      </div>
    </div>
  );
}
