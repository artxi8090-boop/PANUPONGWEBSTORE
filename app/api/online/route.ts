import { NextRequest, NextResponse } from "next/server";
import { sql, ensureTablesInitialized } from "@/lib/db";

async function ensureOnlineTable(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS online_users (
      id SERIAL PRIMARY KEY,
      session_id TEXT UNIQUE NOT NULL,
      last_seen BIGINT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
}

export async function GET() {
  try {
    await ensureTablesInitialized();
    await ensureOnlineTable();

    const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 300;
    await sql`DELETE FROM online_users WHERE last_seen < ${fiveMinutesAgo}`;

    const result = await sql`SELECT COUNT(*) as count FROM online_users`;
    const count = Number((result.rows[0] as { count: string | number }).count);

    return NextResponse.json({ online: count });
  } catch (error) {
    console.error("Error fetching online users:", error);
    return NextResponse.json({ online: 0 }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    await ensureTablesInitialized();
    await ensureOnlineTable();

    const now = Math.floor(Date.now() / 1000);

    await sql`
      INSERT INTO online_users (session_id, last_seen)
      VALUES (${sessionId}, ${now})
      ON CONFLICT(session_id) DO UPDATE SET last_seen = ${now}
    `;

    const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 300;
    await sql`DELETE FROM online_users WHERE last_seen < ${fiveMinutesAgo}`;

    const result = await sql`SELECT COUNT(*) as count FROM online_users`;
    const count = Number((result.rows[0] as { count: string | number }).count);

    return NextResponse.json({ online: count });
  } catch (error) {
    console.error("Error updating online users:", error);
    return NextResponse.json({ online: 0 }, { status: 500 });
  }
}
