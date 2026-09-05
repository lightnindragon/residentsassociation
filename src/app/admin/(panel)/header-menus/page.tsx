import { getNavMenu } from "@/lib/nav-menu";
import { HeaderMenuEditor } from "./HeaderMenuEditor";

export default async function AdminHeaderMenusPage() {
  const [desktop, mobile] = await Promise.all([getNavMenu("desktop"), getNavMenu("mobile")]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
        Header menus
      </h1>
      <p className="mt-1 max-w-2xl text-[var(--color-muted)]">
        Build the public header the same way as WordPress: add pages, drag to reorder, and indent
        to create a submenu. Desktop and mobile can be different.
      </p>
      <HeaderMenuEditor desktop={desktop} mobile={mobile} />
    </div>
  );
}