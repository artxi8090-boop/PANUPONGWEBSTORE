import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { securityHeaders, getStrictCSP } from "@/config/security";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-secret-must-be-overridden-in-production"
);

const PUBLIC_PATHS = [
  "/",
  "/about",
  "/contact",
  "/login",
  "/signup",
  "/api/auth/login",
  "/api/auth/signup",
  "/api/contact",
  "/api/online",
  "/api/projects",
];

const STATIC_ASSET_PATTERN = /\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot|map|webp)$/i;

interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function isStaticAsset(pathname: string): boolean {
  return (
    STATIC_ASSET_PATTERN.test(pathname) ||
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image") ||
    pathname.startsWith("/favicon.ico")
  );
}

async function verifyAuthToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify<JWTPayload>(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });
    return payload as JWTPayload;
  } catch {
    return null;
  }
}

function createRedirectToLogin(request: NextRequest): NextResponse {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete("auth_token");
  return response;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const cspNonce = crypto.randomUUID();

  for (const [key, value] of securityHeaders) {
    response.headers.set(key, value);
  }

  response.headers.set("Content-Security-Policy", getStrictCSP({ nonce: cspNonce }));
  response.headers.set("X-Request-Id", cspNonce);

  if (isPublicPath(pathname)) {
    return response;
  }

  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return createRedirectToLogin(request);
  }

  const payload = await verifyAuthToken(token);

  if (!payload) {
    return createRedirectToLogin(request);
  }

  if (pathname.startsWith("/admin") && payload.role !== "admin") {
    const forbiddenResponse = NextResponse.redirect(new URL("/profile", request.url));
    for (const [key, value] of securityHeaders) {
      forbiddenResponse.headers.set(key, value);
    }
    forbiddenResponse.headers.set("Content-Security-Policy", getStrictCSP({ nonce: cspNonce }));
    return forbiddenResponse;
  }

  response.headers.set("X-User-Id", payload.sub);
  response.headers.set("X-User-Role", payload.role);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
