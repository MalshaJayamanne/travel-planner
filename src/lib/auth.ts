import { sign, verify, JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

// Load secret from environment (server‑only)
const JWT_SECRET = process.env.JWT_SECRET ?? "";

        if (!email || !password) {
          return null;
        }

/**
 * Create a signed JWT for a given payload.
 * @param payload - Object to embed in the token (e.g., { userId: string })
 * @param expiresIn - Expiration time (default 1h)
 */
export function createToken(payload: JwtPayload, expiresIn: SignOptions['expiresIn'] = '1h'): string {
  const secret: Secret = JWT_SECRET;
  return sign(payload, secret, { expiresIn });
}

        if (!user || !verifyPassword(password, user.passwordHash)) {
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
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },
};
