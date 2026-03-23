"use client";

import { Button } from "@/components/ui";

export function QuoteButton({ authorName, htmlBody }: { authorName: string; htmlBody: string }) {
  function handleQuote() {
    const quoteHtml = `<blockquote><strong>${authorName} said:</strong><br/>${htmlBody}</blockquote><p></p>`;
    window.dispatchEvent(new CustomEvent("forum-quote", { detail: { html: quoteHtml } }));
    
    // Smooth scroll to reply form if it exists
    const form = document.getElementById("reply-form");
    if (form) {
      form.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <Button variant="ghost" onClick={handleQuote} className="px-2 py-1 text-xs text-[var(--color-muted)] hover:text-[var(--foreground)]">
      Quote
    </Button>
  );
}
