import { NextRequest, NextResponse } from "next/server";
import { createAndSetSession } from "@/lib/auth/jwt";
import { getUserByEmail, createUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    const storedState = request.cookies.get("github_oauth_state")?.value;

    if (!code || !state || state !== storedState) {
      return NextResponse.redirect(new URL("/login?error=invalid_state", request.url));
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const redirectUri = process.env.GITHUB_REDIRECT_URI || `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/github/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL("/login?error=oauth_not_configured", request.url));
    }

    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      return NextResponse.redirect(new URL("/login?error=token_failed", request.url));
    }

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return NextResponse.redirect(new URL("/login?error=no_token", request.url));
    }

    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!userResponse.ok) {
      return NextResponse.redirect(new URL("/login?error=user_fetch_failed", request.url));
    }

    const githubUser = await userResponse.json();

    if (!githubUser.email) {
      const emailResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (emailResponse.ok) {
        const emails = await emailResponse.json();
        const primaryEmail = emails.find((e: { primary: boolean; verified: boolean }) => e.primary && e.verified);
        if (primaryEmail) {
          githubUser.email = primaryEmail.email;
        }
      }
    }

    if (!githubUser.email) {
      return NextResponse.redirect(new URL("/login?error=no_email", request.url));
    }

    const sanitizedEmail = githubUser.email.toLowerCase().trim();
    const githubId = `github_${githubUser.id}`;

    let existingUser = await getUserByEmail(sanitizedEmail);

    if (!existingUser) {
      const passwordHash = await generateRandomPassword();
      const userId = await createUser(githubUser.name || githubUser.login, sanitizedEmail, passwordHash, "client");
      existingUser = await getUserByEmail(sanitizedEmail);

      if (!existingUser) {
        return NextResponse.redirect(new URL("/login?error=user_creation_failed", request.url));
      }
    }

    await createAndSetSession(existingUser.id, existingUser.email, existingUser.role);

    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("github_oauth_state");

    return response;
  } catch (error) {
    console.error("[GitHub OAuth Error]", error);
    return NextResponse.redirect(new URL("/login?error=oauth_error", request.url));
  }
}

async function generateRandomPassword(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(36).padStart(2, "0")).join("");
}
