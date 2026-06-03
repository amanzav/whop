import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { findUserByCredentials } from "@/lib/data/seed";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  // V1 demo secret fallback so the app runs with zero env setup.
  secret: process.env.AUTH_SECRET ?? "dev-whop-marketplace-secret",
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: (credentials) => {
        const email = String(credentials?.email ?? "");
        const password = String(credentials?.password ?? "");
        const user = findUserByCredentials(email, password);
        if (!user) return null;
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.uid = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.uid && session.user) {
        session.user.id = token.uid as string;
      }
      return session;
    },
  },
});
