import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const path = req.nextUrl.pathname;
  const isAdmin = path.startsWith("/admin");
  const isForum = path.startsWith("/forum");
  const session = req.auth;

  if (isAdmin) {
    if (!session?.user) {
      const login = new URL("/login", req.url);
      login.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(login);
    }
    const role = (session.user as { role?: string }).role;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (isForum) {
    if (!session?.user) {
      const login = new URL("/login", req.url);
      login.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/forum/:path*"],
};
