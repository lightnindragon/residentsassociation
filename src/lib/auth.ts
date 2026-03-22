import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getSql } from "@/lib/db";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    approved: boolean;
  }

  interface Session {
    user: User & { id: string; role: string; approved: boolean };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: string;
    approved: boolean;
  }
}

const nextAuth = NextAuth({
  logger: { error() {}, warn() {}, debug() {} },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);

        try {
          const sql = getSql();
          const rows = await sql`
            SELECT id, email, name, role, password_hash, approved, banned
            FROM users
            WHERE email = ${email}
            LIMIT 1
          `;
          const user = rows[0] as
            | {
                id: string;
                email: string;
                name: string;
                role: string;
                password_hash: string;
                approved: boolean | null;
                banned: boolean | null;
              }
            | undefined;
          if (!user || !user.password_hash) return null;
          if (user.banned === true) return null;
          const valid = await bcrypt.compare(password, user.password_hash);
          if (!valid) return null;
          const role = user.role ?? "user";
          const isElevated = role === "admin" || role === "dev";
          const approved = user.approved !== false;
          if (!isElevated && !approved) return null;
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role,
            approved: isElevated ? true : approved,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "user";
        token.email = user.email;
        token.name = user.name;
        token.approved = (user as { approved?: boolean }).approved !== false;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session?.user) {
        (session.user as { id: string; role: string; approved: boolean }).id =
          (token as { id?: string }).id ?? "";
        (session.user as { id: string; role: string; approved: boolean }).role =
          (token as { role?: string }).role ?? "user";
        (session.user as { id: string; role: string; approved: boolean }).approved =
          (token as { approved?: boolean }).approved !== false;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export const { handlers, signIn, signOut } = nextAuth;

const authInternal = nextAuth.auth;

export async function auth() {
  try {
    return await authInternal();
  } catch {
    return null;
  }
}
