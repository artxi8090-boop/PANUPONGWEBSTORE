// Build-time guard: Next.js sets NEXT_PHASE during build
const IS_BUILD_TIME = process.env.NEXT_PHASE?.includes("build") ?? false;

type SqlFunction = typeof import("@vercel/postgres").sql;

let sqlInstance: SqlFunction | null = null;
let tablesInitialized = false;
let initPromise: Promise<void> | null = null;

async function getSql(): Promise<SqlFunction> {
  if (IS_BUILD_TIME) {
    throw new Error("[DB] Database connection is not available during build time");
  }

  if (!sqlInstance) {
    const mod = await import("@vercel/postgres");
    sqlInstance = mod.sql;
  }
  return sqlInstance;
}

async function initializeTables(): Promise<void> {
  if (tablesInitialized) return;
  if (IS_BUILD_TIME) return;

  const postgresUrl = process.env.POSTGRES_URL;
  if (!postgresUrl) {
    console.warn("[DB] POSTGRES_URL not set. Database operations will fail at runtime.");
    return;
  }

  try {
    const sql = await getSql();

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('client', 'freelancer', 'admin')),
        email_verified BOOLEAN DEFAULT false,
        is_locked BOOLEAN DEFAULT false,
        locked_until BIGINT DEFAULT 0,
        failed_login_attempts INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS login_attempts (
        id SERIAL PRIMARY KEY,
        ip_address TEXT NOT NULL,
        email TEXT,
        attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL,
        expires_at BIGINT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_login_attempts_time ON login_attempts(attempted_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`;

    tablesInitialized = true;
  } catch (error) {
    console.error("[DB] Table initialization failed:", error);
    throw new Error("Database connection failed");
  }
}

export async function ensureTablesInitialized(): Promise<void> {
  if (IS_BUILD_TIME) return;

  const postgresUrl = process.env.POSTGRES_URL;
  if (!postgresUrl) return;

  if (!initPromise) {
    initPromise = initializeTables();
  }
  return initPromise;
}

export async function getDb() {
  return getSql();
}

export type VercelPoolClient = import("@vercel/postgres").VercelPool;
