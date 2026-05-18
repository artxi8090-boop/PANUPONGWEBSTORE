import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth/jwt";
import { cleanExpiredSessions } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  try {
    await clearSession();
    await cleanExpiredSessions();

    return NextResponse.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("[Logout API Error]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
