import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyCredentials } from "./auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "אימייל", type: "email" },
        password: { label: "סיסמה", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const result = await verifyCredentials(
          credentials.email,
          credentials.password
        );
        if (!result.success) return null;
        return {
          id: result.userId,
          email: credentials.email,
          status: result.status,
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.status = (user as { status?: string }).status ?? "PENDING";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string; userId?: string; status?: string }).userId = token.userId as string;
        (session.user as { id?: string; userId?: string; status?: string }).status = (token.status as string) ?? "PENDING";
      }
      return session;
    },
  },
};
