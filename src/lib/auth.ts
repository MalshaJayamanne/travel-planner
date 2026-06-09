import { sign, verify, JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

// Load secret from environment (server‑only)
const JWT_SECRET = process.env.JWT_SECRET ?? "";

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment');
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

/**
 * Verify and decode a JWT.
 * @param token - JWT string from Authorization header
 * @returns decoded payload if valid, otherwise throws
 */
export function verifyToken(token: string): JwtPayload {
  return verify(token, JWT_SECRET) as JwtPayload;
}
