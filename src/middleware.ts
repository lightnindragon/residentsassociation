import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isAdmin = path.startsWith("/admin");
  const isAdminLogin = path === "/admin/login" || path.startsWith("/admin/login/");
  const isForum = path.startsWith("/forum");
  const isForumSetup = path.startsWith("/forum/setup");

  const { auth } = await import("@/lib/auth");
  const session = await auth();

  if (isAdmin) {
    if (isAdminLogin) {
      if (session?.user) {
        const role = (session.user as { role?: string }).role;
        if (role === "admin" || role === "dev") {
          return NextResponse.redirect(new URL("/admin", req.url));
        }
        return NextResponse.redirect(new URL("/", req.url));
      }
      return NextResponse.next();
    }
    if (!session?.user) {
      const login = new URL("/admin/login", req.url);
      login.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(login);
    }
    const role = (session.user as { role?: string }).role;
    if (role !== "admin" && role !== "dev") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (isForum) {
    if (!session?.user) {
      const login = new URL("/login", req.url);
      login.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(login);
    }
    if (!isForumSetup) {
      const userId = (session.user as { id?: string }).id;
      const dbUrl = process.env.DATABASE_URL;
      if (userId && dbUrl) {
        try {
          const sql = neon(dbUrl);
          const rows = await sql`
            SELECT forum_username, forum_town FROM users WHERE id = ${userId}::uuid LIMIT 1
          `;
          const row = rows[0] as { forum_username: string | null; forum_town: string | null } | undefined;
          const hasProfile =
            row &&
            typeof row.forum_username === "string" &&
            row.forum_username.trim() !== "" &&
            typeof row.forum_town === "string" &&
            row.forum_town.trim() !== "";
          if (!hasProfile) {
            const setup = new URL("/forum/setup", req.url);
            setup.searchParams.set("callbackUrl", path || "/forum");
            return NextResponse.redirect(setup);
          }
        } catch {
          // DB error; allow through
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/forum/:path*"],
};
