export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold text-[var(--foreground)]">
        Cookie Policy
      </h1>
      <div className="prose mt-8 max-w-none text-[var(--foreground)]">
        <p>
          This site uses cookies to provide core functionality and to keep you
          signed in.
        </p>
        <h2 className="font-heading mt-6 text-xl font-medium">What we use</h2>
        <p>
          <strong>Session / authentication cookies:</strong> When you sign in,
          we set a cookie so the site can recognise you on future visits. These
          are essential for the forum and admin areas to work.
        </p>
        <p>
          We do not use third-party advertising or tracking cookies. We only
          use cookies that are necessary for the operation of the site.
        </p>
        <h2 className="font-heading mt-6 text-xl font-medium">Managing cookies</h2>
        <p>
          You can disable or delete cookies in your browser settings. If you
          do, you may not be able to sign in or use certain features.
        </p>
      </div>
    </div>
  );
}
