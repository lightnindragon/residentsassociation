import { getSql } from "@/lib/db";
import { getHeaderNewsCategories } from "@/lib/news-nav";

export type NavMenuKey = "desktop" | "mobile";

export type NavItem = {
  id: string;
  label: string;
  href: string;
  openInNewTab?: boolean;
  includeNewsCategories?: boolean;
  children?: NavItem[];
};

export const NAV_PAGE_OPTIONS: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "News", href: "/news" },
  { label: "Planning applications", href: "/planning-applications" },
  { label: "Documents", href: "/documents" },
  { label: "Agendas", href: "/agendas" },
  { label: "Minutes", href: "/minutes" },
  { label: "Events", href: "/events" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

function nid(seed: string): string {
  return `nav-${seed}`;
}

export const DEFAULT_DESKTOP_NAV: NavItem[] = [
  { id: nid("d-home"), label: "Home", href: "/" },
  {
    id: nid("d-news"),
    label: "News",
    href: "/news",
    includeNewsCategories: true,
    children: [
      { id: nid("d-news-all"), label: "All news", href: "/news" },
      { id: nid("d-news-events"), label: "Events", href: "/events" },
    ],
  },
  { id: nid("d-planning"), label: "Planning", href: "/planning-applications" },
  {
    id: nid("d-docs"),
    label: "Documents",
    href: "/documents",
    children: [
      { id: nid("d-docs-agendas"), label: "Agendas", href: "/agendas" },
      { id: nid("d-docs-minutes"), label: "Minutes", href: "/minutes" },
      { id: nid("d-docs-constitution"), label: "Constitution", href: "/documents#constitution" },
      { id: nid("d-docs-conduct"), label: "Code of conduct", href: "/documents#code-of-conduct" },
    ],
  },
  { id: nid("d-about"), label: "About", href: "/about" },
  { id: nid("d-contact"), label: "Contact", href: "/contact" },
  { id: nid("d-gallery"), label: "Gallery", href: "/gallery" },
];

export const DEFAULT_MOBILE_NAV: NavItem[] = [
  { id: nid("m-home"), label: "Home", href: "/" },
  {
    id: nid("m-news"),
    label: "News",
    href: "/news",
    includeNewsCategories: true,
    children: [
      { id: nid("m-news-all"), label: "All news", href: "/news" },
      { id: nid("m-news-events"), label: "Events", href: "/events" },
    ],
  },
  { id: nid("m-planning"), label: "Planning", href: "/planning-applications" },
  {
    id: nid("m-docs"),
    label: "Documents",
    href: "/documents",
    children: [
      { id: nid("m-docs-agendas"), label: "Agendas", href: "/agendas" },
      { id: nid("m-docs-minutes"), label: "Minutes", href: "/minutes" },
      { id: nid("m-docs-constitution"), label: "Constitution", href: "/documents#constitution" },
      { id: nid("m-docs-conduct"), label: "Code of conduct", href: "/documents#code-of-conduct" },
    ],
  },
  { id: nid("m-gallery"), label: "Gallery", href: "/gallery" },
  { id: nid("m-contact"), label: "Contact", href: "/contact" },
  { id: nid("m-about"), label: "About", href: "/about" },
];

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function sanitizeItem(raw: unknown, depth: number): NavItem | null {
  if (!isRecord(raw)) return null;
  const label = typeof raw.label === "string" ? raw.label.trim() : "";
  if (!label) return null;
  const href = typeof raw.href === "string" ? raw.href.trim() : "";
  const id =
    typeof raw.id === "string" && raw.id.trim()
      ? raw.id.trim()
      : `nav-${Math.random().toString(36).slice(2, 10)}`;
  const item: NavItem = { id, label, href };
  if (raw.openInNewTab === true) item.openInNewTab = true;
  if (raw.includeNewsCategories === true) item.includeNewsCategories = true;
  if (depth < 1 && Array.isArray(raw.children)) {
    const children = raw.children
      .map((child) => sanitizeItem(child, depth + 1))
      .filter((c): c is NavItem => c !== null);
    if (children.length > 0) item.children = children;
  }
  return item;
}

export function sanitizeNavItems(raw: unknown): NavItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => sanitizeItem(item, 0)).filter((i): i is NavItem => i !== null);
}

export function defaultNavFor(key: NavMenuKey): NavItem[] {
  return key === "mobile" ? DEFAULT_MOBILE_NAV : DEFAULT_DESKTOP_NAV;
}

export async function getStoredNavMenu(key: NavMenuKey): Promise<NavItem[] | null> {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT items FROM nav_menus WHERE menu_key = ${key} LIMIT 1
    `;
    const row = rows[0] as { items: unknown } | undefined;
    if (!row) return null;
    let raw: unknown = row.items;
    if (typeof raw === "string") {
      try {
        raw = JSON.parse(raw);
      } catch {
        return null;
      }
    }
    const items = sanitizeNavItems(raw);
    return items.length > 0 ? items : null;
  } catch {
    return null;
  }
}

export async function getNavMenu(key: NavMenuKey): Promise<NavItem[]> {
  return (await getStoredNavMenu(key)) ?? defaultNavFor(key);
}

function cloneItems(items: NavItem[]): NavItem[] {
  return items.map((item) => ({
    ...item,
    children: item.children ? cloneItems(item.children) : undefined,
  }));
}

export async function getResolvedNavMenu(key: NavMenuKey): Promise<NavItem[]> {
  const items = cloneItems(await getNavMenu(key));
  const needsCats = items.some((item) => item.includeNewsCategories);
  const categories = needsCats ? await getHeaderNewsCategories() : [];
  const catItems: NavItem[] = categories.map((c) => ({
    id: `news-cat-${c.slug}`,
    label: c.name,
    href: `/news/category/${c.slug}`,
  }));

  for (const item of items) {
    if (!item.includeNewsCategories || catItems.length === 0) continue;
    const existing = item.children ?? [];
    const withoutCats = existing.filter((c) => !c.id.startsWith("news-cat-"));
    const insertAt = withoutCats.findIndex((c) => c.href === "/news") + 1;
    const at = insertAt > 0 ? insertAt : 0;
    item.children = [...withoutCats.slice(0, at), ...catItems, ...withoutCats.slice(at)];
  }
  return items;
}
