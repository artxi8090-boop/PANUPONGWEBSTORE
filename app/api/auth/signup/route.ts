import { NextRequest, NextResponse } from "next/server";
import { validateSignupInput, hashPassword, getUserByEmail, createUser, checkRateLimit, recordLoginAttempt } from "@/lib/auth";
import { createAndSetSession } from "@/lib/auth/jwt";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "unknown";

    const rateLimit = await checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json({ success: false, error: "Too many attempts. Please try again later.", retryAfter: rateLimit.retryAfter }, { status: 429 });
    }

    const body = await request.json();

    const validationResult = validateSignupInput(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error },
        { status: 400 }
      );
    }

    const { name, email, password, role } = validationResult.data!;
    const sanitizedEmail = email.toLowerCase().trim();

    await recordLoginAttempt(ip, sanitizedEmail);

    const existingUser = await getUserByEmail(sanitizedEmail);
    if (existingUser) {
      return NextResponse.json({ success: false, error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = hashPassword(password);
    const userId = await createUser(name, sanitizedEmail, passwordHash, role);

    await createAndSetSession(userId, sanitizedEmail, role);

    return NextResponse.json(
      { success: true, message: "Account created successfully", user: { id: userId, name, email: sanitizedEmail, role } },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Signup API Error]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
