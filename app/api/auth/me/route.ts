import { NextRequest, NextResponse } from "next/server";
import { verifyServerToken } from "@/lib/auth/jwt";
import { getUserById } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const payload = await verifyServerToken();

    if (!payload) {
      const response = NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
      response.cookies.delete("auth_token");
      return response;
    }

    const user = await getUserById(payload.sub);

    if (!user) {
      const response = NextResponse.json({ success: false, error: "User not found" }, { status: 401 });
      response.cookies.delete("auth_token");
      return response;
    }

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error("[Me API Error]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
