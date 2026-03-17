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
  }

  interface Session {
    user: User & { id: string; role: string };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
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
            SELECT id, email, name, role, password_hash
            FROM users
            WHERE email = ${email}
            LIMIT 1
          `;
          const user = rows[0] as
            | { id: string; email: string; name: string; role: string; password_hash: string }
            | undefined;
          if (!user || !user.password_hash) return null;
          const valid = await bcrypt.compare(password, user.password_hash);
          if (!valid) return null;
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
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
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        (session.user as { id: string; role: string }).id = token.id;
        (session.user as { id: string; role: string }).role = token.role ?? "user";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
