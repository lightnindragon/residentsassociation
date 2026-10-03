import Link from "next/link";
import { getNavMenu } from "@/lib/nav-menu";
import { getPublishedSitePageOptions } from "@/lib/site-pages";
import { HeaderMenuEditor } from "./HeaderMenuEditor";

export default async function AdminHeaderMenusPage() {
  const [desktop, mobile, customPages] = await Promise.all([
    getNavMenu("desktop"),
    getNavMenu("mobile"),
    getPublishedSitePageOptions(),
  ]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
        Header menus
      </h1>
      <p className="mt-1 max-w-2xl text-[var(--color-muted)]">
        Build the public header the same way as WordPress: add pages, drag to reorder, and indent
        to create a submenu. Desktop and mobile can be different. To create a new website page,
        use{" "}
        <Link href="/admin/pages" className="text-[var(--color-primary)] underline">
          Pages
        </Link>
        .
      </p>
      <HeaderMenuEditor desktop={desktop} mobile={mobile} customPages={customPages} />
    </div>
  );
}