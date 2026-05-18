import { NextRequest, NextResponse } from "next/server";
import { validateLoginInput, verifyPassword, checkRateLimit, recordLoginAttempt, checkAccountLockout, incrementFailedAttempts, resetFailedAttempts, cleanOldLoginAttempts, getUserByEmail } from "@/lib/auth";
import { createAndSetSession } from "@/lib/auth/jwt";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await cleanOldLoginAttempts();

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "unknown";

    const rateLimit = await checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json({ success: false, error: "Too many attempts. Please try again later.", retryAfter: rateLimit.retryAfter }, { status: 429 });
    }

    const body = await request.json();

    const validationResult = validateLoginInput(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data!;
    const sanitizedEmail = email.toLowerCase().trim();

    await recordLoginAttempt(ip, sanitizedEmail);

    const user = await getUserByEmail(sanitizedEmail);

    if (!user) {
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
    }

    const lockout = await checkAccountLockout(sanitizedEmail);
    if (lockout.locked) {
      const remainingMinutes = Math.ceil((lockout.remainingMs || 0) / 60000);
      return NextResponse.json({ success: false, error: `Account locked. Try again in ${remainingMinutes} minutes.` }, { status: 423 });
    }

    const isValidPassword = verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      await incrementFailedAttempts(sanitizedEmail);
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
    }

    await resetFailedAttempts(sanitizedEmail);

    await createAndSetSession(user.id, user.email, user.role);

    return NextResponse.json(
      { success: true, message: "Login successful", user: { id: user.id, name: user.name, email: user.email, role: user.role } },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Login API Error]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
