import { getSql } from "@/lib/db";

/**
 * Hero and other CMS image URLs are often set while developing (seed scripts hitting prod DB).
 * Absolute URLs to localhost break on production; absolute URLs to this site's own host can
 * require extra `images.remotePatterns` — path-only URLs always work for `/public` files.
 */
export function normalizeSiteImageUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  function candidateOrigins(): string[] {
    const out: string[] = [];
    const nextAuth = process.env.NEXTAUTH_URL?.trim().replace(/\/$/, "");
    if (nextAuth?.startsWith("http")) {
      try {
        out.push(new URL(nextAuth).origin);
      } catch {
        /* ignore */
      }
    }
    const vercel = process.env.VERCEL_URL?.trim();
    if (vercel) {
      out.push(`https://${vercel}`);
    }
    return [...new Set(out)];
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host === "[::1]" ||
      host.endsWith(".local")
    ) {
      return `${parsed.pathname}${parsed.search}`;
    }
    for (const origin of candidateOrigins()) {
      if (parsed.origin === origin) {
        return `${parsed.pathname}${parsed.search}`;
      }
    }
  } catch {
    return trimmed;
  }
  return trimmed;
}

export type ContactContent = {
  title: string;
  description: string;
  labelName: string;
  labelEmail: string;
  labelSubject: string;
  labelMessage: string;
  labelSubmit: string;
};

/** Public homepage hero — URL from `site_content.home_hero_image_url` (e.g. Vercel Blob after `upload-home-hero-blob`). */
export async function getHomeHeroImageUrl(): Promise<string> {
  try {
    const sql = getSql();
    const rows = await sql`SELECT value FROM site_content WHERE key = 'home_hero_image_url' LIMIT 1`;
    const row = rows[0] as { value: string } | undefined;
    return normalizeSiteImageUrl(row?.value ?? "");
  } catch {
    return "";
  }
}

const DEFAULT_CONSTITUTION_PDF = "/documents/culcheth-glazebury-ra-constitution.pdf";

/** Constitution PDF — `site_content.constitution_pdf_url` (Vercel Blob) or local /public fallback. */
export async function getConstitutionPdfUrl(): Promise<string> {
  try {
    const sql = getSql();
    const rows = await sql`SELECT value FROM site_content WHERE key = 'constitution_pdf_url' LIMIT 1`;
    const row = rows[0] as { value: string } | undefined;
    const fromDb = normalizeSiteImageUrl(row?.value ?? "");
    return fromDb || DEFAULT_CONSTITUTION_PDF;
  } catch {
    return DEFAULT_CONSTITUTION_PDF;
  }
}

export async function getAboutIntro(): Promise<string> {
  try {
    const sql = getSql();
    const rows = await sql`SELECT value FROM site_content WHERE key = 'about_intro' LIMIT 1`;
    const row = rows[0] as { value: string } | undefined;
    return row?.value ?? "";
  } catch {
    return "";
  }
}

export async function getCommitteeMembers(): Promise<
  Array<{ id: string; name: string; role: string; bio: string | null; image_url: string | null; sort_order: number }>
> {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT id, name, role, bio, image_url, sort_order
      FROM committee_members
      ORDER BY sort_order ASC, name ASC
    `;
    return rows as Array<{ id: string; name: string; role: string; bio: string | null; image_url: string | null; sort_order: number }>;
  } catch {
    return [];
  }
}

export async function getContactContent(): Promise<ContactContent> {
  const defaults: ContactContent = {
    title: "Contact us",
    description: "Send a message to the residents association. We'll get back to you as soon as we can.",
    labelName: "Your name",
    labelEmail: "Email",
    labelSubject: "Subject",
    labelMessage: "Message",
    labelSubmit: "Send message",
  };
  try {
    const sql = getSql();
    const rows = await sql`SELECT key, value FROM site_content`;
    const map: Record<string, string> = {};
    for (const r of rows as Array<{ key: string; value: string }>) {
      map[r.key] = r.value;
    }
    return {
      title: map.contact_title ?? defaults.title,
      description: map.contact_description ?? defaults.description,
      labelName: map.contact_label_name ?? defaults.labelName,
      labelEmail: map.contact_label_email ?? defaults.labelEmail,
      labelSubject: map.contact_label_subject ?? defaults.labelSubject,
      labelMessage: map.contact_label_message ?? defaults.labelMessage,
      labelSubmit: map.contact_label_submit ?? defaults.labelSubmit,
    };
  } catch {
    return defaults;
  }
}
