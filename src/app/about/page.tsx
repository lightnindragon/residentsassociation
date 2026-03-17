export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold text-[var(--foreground)]">
        About us
      </h1>
      <div className="prose mt-8 max-w-none text-[var(--foreground)]">
        <p>
          The Culcheth & Glazebury Residents Association represents and supports
          residents in the Culcheth and Glazebury areas. We work to promote
          community interests, share local news and events, and provide a forum
          for discussion.
        </p>
        <p>
          This website is your hub for the latest news, a residents’ forum,
          gallery, and a way to get in touch with the committee. If you’d like
          to get involved or have questions, please use the Contact page.
        </p>
      </div>
    </div>
  );
}
