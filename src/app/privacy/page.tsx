export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold text-[var(--foreground)]">
        Privacy Policy
      </h1>
      <div className="prose mt-8 max-w-none text-[var(--foreground)]">
        <p>
          The Culcheth & Glazebury Residents Association (“we”) is committed to
          protecting your privacy. This policy explains how we collect, use and
          store your information when you use this website.
        </p>
        <h2 className="font-heading mt-6 text-xl font-medium">Information we collect</h2>
        <p>
          When you sign up, we store your name, email address and a hashed
          password. When you use the contact form we store your name, email,
          subject and message so we can respond and manage enquiries. Forum
          posts and any content you submit are stored and may be displayed
          in line with the site’s purpose.
        </p>
        <h2 className="font-heading mt-6 text-xl font-medium">How we use it</h2>
        <p>
          We use your information to run the site, manage your account, respond
          to contact messages, and send you administrative or assignment
          notifications (for example when a contact message is assigned to you
          as an admin). We do not sell your data to third parties.
        </p>
        <h2 className="font-heading mt-6 text-xl font-medium">Cookies</h2>
        <p>
          We use cookies for session and authentication. See our Cookie Policy
          for more detail.
        </p>
        <h2 className="font-heading mt-6 text-xl font-medium">Your rights</h2>
        <p>
          You can request access to, correction or deletion of your personal
          data by contacting us. You may also have rights under applicable data
          protection laws.
        </p>
      </div>
    </div>
  );
}
