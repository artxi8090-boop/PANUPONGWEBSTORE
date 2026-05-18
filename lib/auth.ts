import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { ensureTablesInitialized, getDb } from "./db";
import { loginSchema, signupSchema, LoginInput, SignupInput } from "./validations";

const BCRYPT_ROUNDS = 12;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_RATE_LIMIT_ATTEMPTS = 20;

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, BCRYPT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function validateLoginInput(data: unknown): { success: boolean; data?: LoginInput; error?: string } {
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }
  return { success: true, data: result.data };
}

export function validateSignupInput(data: unknown): { success: boolean; data?: SignupInput; error?: string } {
  const result = signupSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }
  return { success: true, data: result.data };
}

function getFirstRow<T>(result: unknown): T | undefined {
  const rows = Array.isArray(result) ? result : [];
  return (rows[0] as T) ?? undefined;
}

export async function checkRateLimit(ip: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  try {
    await ensureTablesInitialized();
    const sql = await getDb();
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

    const result = await sql`
      SELECT COUNT(*) as count FROM login_attempts
      WHERE ip_address = ${ip} AND attempted_at > ${windowStart}::timestamp
    `;

    const row = getFirstRow<{ count: string | number }>(result);
    const count = Number(row?.count ?? 0);

    if (count >= MAX_RATE_LIMIT_ATTEMPTS) {
      return { allowed: false, retryAfter: RATE_LIMIT_WINDOW_MS / 1000 };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return { allowed: true };
  }
}

export async function recordLoginAttempt(ip: string, email: string): Promise<void> {
  try {
    await ensureTablesInitialized();
    const sql = await getDb();
    await sql`
      INSERT INTO login_attempts (ip_address, email) VALUES (${ip}, ${email})
    `;
  } catch (error) {
    console.error("Failed to record login attempt:", error);
  }
}

export async function checkAccountLockout(email: string): Promise<{ locked: boolean; remainingMs?: number }> {
  try {
    await ensureTablesInitialized();
    const sql = await getDb();
    const result = await sql`
      SELECT is_locked, locked_until, failed_login_attempts FROM users WHERE email = ${email}
    `;

    const user = getFirstRow<{ is_locked: boolean; locked_until: string | number; failed_login_attempts: number }>(result);

    if (!user) return { locked: false };

    const lockedUntil = Number(user.locked_until);
    const now = Date.now();

    if (user.is_locked && lockedUntil > now) {
      const remainingMs = (lockedUntil - now);
      return { locked: true, remainingMs };
    }

    if (user.is_locked && lockedUntil <= now) {
      await sql`
        UPDATE users SET is_locked = false, locked_until = 0, failed_login_attempts = 0 WHERE email = ${email}
      `;
    }

    return { locked: false };
  } catch (error) {
    console.error("Account lockout check failed:", error);
    return { locked: false };
  }
}

export async function incrementFailedAttempts(email: string): Promise<void> {
  try {
    await ensureTablesInitialized();
    const sql = await getDb();
    const now = Date.now();

    const userResult = await sql`
      SELECT failed_login_attempts FROM users WHERE email = ${email}
    `;

    const user = getFirstRow<{ failed_login_attempts: number }>(userResult);

    if (!user) return;

    const newAttempts = user.failed_login_attempts + 1;

    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      const lockedUntil = now + LOCKOUT_DURATION_MS;
      await sql`
        UPDATE users SET failed_login_attempts = ${newAttempts}, is_locked = true, locked_until = ${lockedUntil} WHERE email = ${email}
      `;
    } else {
      await sql`
        UPDATE users SET failed_login_attempts = ${newAttempts} WHERE email = ${email}
      `;
    }
  } catch (error) {
    console.error("Failed to increment attempts:", error);
  }
}

export async function resetFailedAttempts(email: string): Promise<void> {
  try {
    await ensureTablesInitialized();
    const sql = await getDb();
    await sql`
      UPDATE users SET failed_login_attempts = 0, is_locked = false, locked_until = 0 WHERE email = ${email}
    `;
  } catch (error) {
    console.error("Failed to reset attempts:", error);
  }
}

export async function getUserByEmail(email: string) {
  try {
    await ensureTablesInitialized();
    const sql = await getDb();
    const result = await sql`
      SELECT id, name, email, password_hash, role,
             email_verified, is_locked, locked_until,
             failed_login_attempts, created_at
      FROM users WHERE email = ${email}
    `;

    const row = getFirstRow<Record<string, unknown>>(result);
    if (!row) return undefined;

    return {
      id: row.id as string,
      name: row.name as string,
      email: row.email as string,
      password_hash: row.password_hash as string,
      role: row.role as string,
      email_verified: Number(row.email_verified),
      is_locked: Number(row.is_locked),
      locked_until: Number(row.locked_until),
      failed_login_attempts: Number(row.failed_login_attempts),
      created_at: Number(row.created_at),
    };
  } catch (error) {
    console.error("Failed to get user by email:", error);
    return undefined;
  }
}

export async function getUserById(userId: string) {
  try {
    await ensureTablesInitialized();
    const sql = await getDb();
    const result = await sql`
      SELECT id, name, email, role, email_verified, created_at
      FROM users WHERE id = ${userId}
    `;

    const row = getFirstRow<Record<string, unknown>>(result);
    if (!row) return undefined;

    return {
      id: row.id as string,
      name: row.name as string,
      email: row.email as string,
      role: row.role as string,
      email_verified: Number(row.email_verified),
      created_at: Number(row.created_at),
    };
  } catch (error) {
    console.error("Failed to get user by id:", error);
    return undefined;
  }
}

export async function createUser(name: string, email: string, passwordHash: string, role: string): Promise<string> {
  try {
    await ensureTablesInitialized();
    const sql = await getDb();
    const id = randomBytes(16).toString("hex");

    await sql`
      INSERT INTO users (id, name, email, password_hash, role)
      VALUES (${id}, ${name}, ${email}, ${passwordHash}, ${role})
    `;

    return id;
  } catch (error) {
    console.error("Failed to create user:", error);
    throw new Error("User creation failed");
  }
}

export async function cleanOldLoginAttempts(): Promise<void> {
  try {
    await ensureTablesInitialized();
    const sql = await getDb();
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    await sql`DELETE FROM login_attempts WHERE attempted_at < ${windowStart}::timestamp`;
  } catch (error) {
    console.error("Failed to clean login attempts:", error);
  }
}

export async function cleanExpiredSessions(): Promise<void> {
  try {
    await ensureTablesInitialized();
    const sql = await getDb();
    const now = Math.floor(Date.now() / 1000);
    await sql`DELETE FROM sessions WHERE expires_at < ${now}`;
  } catch (error) {
    console.error("Failed to clean sessions:", error);
  }
}
