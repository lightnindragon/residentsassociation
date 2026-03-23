import { getSql } from "@/lib/db";


export type ContactContent = {
  title: string;
  description: string;
  labelName: string;
  labelEmail: string;
  labelSubject: string;
  labelMessage: string;
  labelSubmit: string;
};

/** Public homepage hero — set via site_content `home_hero_image_url` (e.g. seed script). */
export async function getHomeHeroImageUrl(): Promise<string> {
  try {
    const sql = getSql();
    const rows = await sql`SELECT value FROM site_content WHERE key = 'home_hero_image_url' LIMIT 1`;
    const row = rows[0] as { value: string } | undefined;
    return row?.value?.trim() ?? "";
  } catch {
    return "";
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
  Array<{ id: string; name: string; role: string; image_url: string | null; sort_order: number }>
> {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT id, name, role, image_url, sort_order
      FROM committee_members
      ORDER BY sort_order ASC, name ASC
    `;
    return rows as Array<{ id: string; name: string; role: string; image_url: string | null; sort_order: number }>;
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
