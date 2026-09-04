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
        Change the public header independently for desktop and mobile. Reorder links, nest a
        submenu, and add pages such as Planning and Documents. Sign in, Account, Forum, and Admin
        stay in the header automatically.
      </p>
      <HeaderMenuEditor desktop={desktop} mobile={mobile} />
    </div>
  );
}