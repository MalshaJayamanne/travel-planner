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

        const email = (credentials.email as string).toLowerCase();
        const user = await findUserByEmail(email);

        if (!user || !verifyPassword(credentials.password as string, user.passwordHash)) {
          return null;
        }

        if (user.isActive === false) {
          throw new Error("Your account has been disabled. Please contact support.");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          isActive: user.isActive,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isActive = user.isActive;
      }
      
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.image !== undefined) token.picture = session.image;
        if (session.role) token.role = session.role;
        if (session.isActive !== undefined) token.isActive = session.isActive;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.id) session.user.id = token.id as string;
        session.user.name = token.name as string | null | undefined;
        session.user.image = token.picture as string | null | undefined;
        session.user.role = (token.role as string) || "TRAVELER";
        session.user.isActive = token.isActive !== false;
      }

      return session;
    },
  },
};

export default NextAuth(authOptions);
