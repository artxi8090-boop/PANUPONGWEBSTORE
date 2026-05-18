import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-secret-must-be-overridden-in-production"
);
const JWT_EXPIRATION = "1d";
const COOKIE_NAME = "auth_token";

interface TokenPayload extends JWTPayload {
  sub: string;
  email: string;
  role: string;
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long");
  }
  return JWT_SECRET;
}

export async function createAndSetSession(userId: string, email: string, role: string): Promise<string> {
  const secret = getJwtSecret();

  const payload: TokenPayload = {
    sub: userId,
    email,
    role,
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(secret);

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 86400,
  });

  return token;
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function verifyServerToken(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify<TokenPayload>(token, secret, {
      algorithms: ["HS256"],
    });
    return payload as TokenPayload;
  } catch {
    return null;
  }
}
