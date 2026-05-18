import { NextRequest, NextResponse } from "next/server";
import { createAndSetSession } from "@/lib/auth/jwt";
import { getUserByEmail, createUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(new URL(`/login?error=google_${error}`, request.url));
    }

    const storedState = request.cookies.get("google_oauth_state")?.value;

    if (!code || !state || state !== storedState) {
      return NextResponse.redirect(new URL("/login?error=invalid_state", request.url));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/google/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL("/login?error=oauth_not_configured", request.url));
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      return NextResponse.redirect(new URL("/login?error=token_failed", request.url));
    }

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return NextResponse.redirect(new URL("/login?error=no_token", request.url));
    }

    const userInfoResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(new URL("/login?error=user_fetch_failed", request.url));
    }

    const googleUser = await userInfoResponse.json();

    if (!googleUser.email) {
      return NextResponse.redirect(new URL("/login?error=no_email", request.url));
    }

    const sanitizedEmail = googleUser.email.toLowerCase().trim();

    let existingUser = await getUserByEmail(sanitizedEmail);

    if (!existingUser) {
      const passwordHash = await generateRandomPassword();
      const userId = await createUser(googleUser.name || googleUser.email, sanitizedEmail, passwordHash, "client");
      existingUser = await getUserByEmail(sanitizedEmail);

      if (!existingUser) {
        return NextResponse.redirect(new URL("/login?error=user_creation_failed", request.url));
      }
    }

    await createAndSetSession(existingUser.id, existingUser.email, existingUser.role);

    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("google_oauth_state");
    response.cookies.delete("google_oauth_nonce");

    return response;
  } catch (error) {
    console.error("[Google OAuth Error]", error);
    return NextResponse.redirect(new URL("/login?error=oauth_error", request.url));
  }
}

async function generateRandomPassword(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(36).padStart(2, "0")).join("");
}
