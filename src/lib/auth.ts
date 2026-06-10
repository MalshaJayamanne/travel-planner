import { sign, verify, JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { findUserByEmail } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

// Load secret from environment (server-only)
const configuredSecret = process.env.NEXTAUTH_SECRET ?? process.env.JWT_SECRET;
const fallbackSecret = process.env.NODE_ENV === "production" ? "" : "dev-nextauth-secret-change-me";
const AUTH_SECRET = configuredSecret ?? fallbackSecret;

export function createToken(payload: JwtPayload, expiresIn: SignOptions["expiresIn"] = "1h"): string {
  const secret: Secret = AUTH_SECRET;
  return sign(payload, secret, { expiresIn });
}

export function verifyToken(token: string): JwtPayload | string {
  return verify(token, AUTH_SECRET);
}

export const authOptions: NextAuthOptions = {
  secret: AUTH_SECRET || undefined,
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await findUserByEmail(credentials.email as string);

        if (!user || !verifyPassword(credentials.password as string, user.passwordHash)) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },
};

export default NextAuth(authOptions);
