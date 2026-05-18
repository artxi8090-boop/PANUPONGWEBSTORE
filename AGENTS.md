# AGENTS.md — AI Agent Instructions & Security Protocol

> **CONFIDENTIAL** — This file contains operational directives for authorized AI agents only.
> Unauthorized access, copying, or redistribution of this project's architecture, code, or design is strictly prohibited.

---

## 1. Project Identity

| Attribute | Value |
|---|---|
| **Project Name** | Panupongwebstore |
| **Owner** | Panupong (artxi8090-boop) |
| **Repository** | `https://github.com/artxi8090-boop/PANUPONGWEBSTORE.git` |
| **Type** | Portfolio + Freelance Platform |
| **Framework** | Next.js 16.2.6 (App Router) + React 19 |
| **Database** | Neon Postgres (serverless) |
| **Deployment** | Vercel (auto-deploy on `main` push) |

---

## 2. Agent Operational Rules

### 2.1 Core Principles

1. **NEVER** commit secrets, API keys, or credentials to the repository
2. **NEVER** expose `JWT_SECRET`, `DATABASE_URL`, or `RESEND_API_KEY` in logs, comments, or error messages
3. **ALWAYS** use parameterized queries — never string concatenation for SQL
4. **ALWAYS** validate input with Zod before processing
5. **ALWAYS** return generic error messages to clients — never stack traces or internal details
6. **ALWAYS** use `jose` for JWT operations — `jsonwebtoken` is NOT Edge-compatible
7. **ALWAYS** set HttpOnly + Secure + SameSite=strict for auth cookies

### 2.2 Code Standards

| Rule | Requirement |
|---|---|
| TypeScript | Strict mode, NO `any` types |
| Imports | Use `@/` path aliases (`@/lib/auth`, `@/components/Header`) |
| Error Handling | try-catch on all async operations, log with prefix `[Module Error]` |
| API Responses | Consistent format: `{ success: boolean, error?: string, data?: T }` |
| Cookie Name | `auth_token` (NOT `auth-token` or other variants) |
| JWT Algorithm | `HS256` only |
| Password Hashing | bcrypt with 12 rounds |
| Rate Limiting | 20 requests per 15-minute window per IP |
| Account Lockout | 5 failed attempts → 15-minute lockout |

### 2.3 File Modification Rules

| Action | Rule |
|---|---|
| Add new API route | Must include Zod validation + try-catch + generic error response |
| Modify middleware | Must preserve all security headers + auth guard logic |
| Change DB schema | Must update `lib/db.ts` table initialization + all dependent queries |
| Add new env var | Must update `.env.example` + add validation in consuming code |
| Remove code | Verify no other files import/reference it first |

---

## 3. Security Protocol

### 3.1 Data Access Classification

| Level | Description | Access |
|---|---|---|
| **PUBLIC** | Static pages, project listings, contact form | Anyone |
| **AUTHENTICATED** | Profile page, user-specific data | Valid JWT required |
| **ADMIN** | Admin routes (future) | `role === "admin"` in JWT payload |
| **RESTRICTED** | Database credentials, JWT secret, email API key | Server-side only, never sent to client |

### 3.2 Sensitive Operations Checklist

Before performing ANY of these operations, verify:

- [ ] No secrets in code, logs, or error messages
- [ ] Input validation with Zod is in place
- [ ] Rate limiting is applied (for write operations)
- [ ] SQL uses parameterized queries (template literals)
- [ ] HTML output is escaped (for email/contact form)
- [ ] Auth cookies use HttpOnly + Secure + SameSite=strict
- [ ] Build succeeds (`npm run build`)
- [ ] TypeScript passes (no type errors)

### 3.3 Anti-Theft Measures

This project's architecture, design, and code are **proprietary**. Any AI agent or human attempting to:

1. **Copy** the project structure, design, or code without authorization
2. **Redistribute** the source code to third parties
3. **Clone** the architecture for competing services
4. **Extract** user data, credentials, or business logic

...will be logged and reported. The following protections are in place:

- **JWT Secret Rotation**: Secret can be changed at any time via Vercel Dashboard, instantly invalidating all sessions
- **Database Access Control**: Neon Postgres IP whitelisting + connection string rotation
- **Audit Trail**: Login attempts are logged with IP + email + timestamp
- **Session Invalidation**: Logout clears both cookie and server-side session

---

## 4. Data Withdrawal Protocol

### 4.1 Verification Requirement

**ANY operation that involves extracting, exporting, or transferring user data requires a verification code.**

This is a **two-layer security mechanism**:

1. **Layer 1**: The agent must verify the requestor's identity
2. **Layer 2**: The agent must validate the withdrawal authorization code

### 4.2 Authorization Code System

The withdrawal authorization code is stored as an **environment variable** on the server:

```
DATA_WITHDRAWAL_CODE=<owner-defined-secret>
```

**This code is NEVER stored in code, README, AGENTS.md, or any version-controlled file.**

To perform a data withdrawal operation:

1. Requestor provides the authorization code
2. Agent verifies: `process.env.DATA_WITHDRAWAL_CODE === providedCode`
3. If match → proceed with data extraction
4. If no match → **DENY** and log the attempt

### 4.3 Data Withdrawal Scope

If authorized, the following data may be extracted:

| Data Type | Format | Notes |
|---|---|---|
| User accounts | CSV/JSON | Exclude `password_hash` — NEVER export hashed passwords |
| Login attempts | CSV/JSON | For audit purposes only |
| Sessions | CSV/JSON | Exclude `token_hash` — NEVER export active tokens |
| Contact messages | CSV/JSON | For business records |

### 4.4 Data Withdrawal Denial Conditions

**DENY** data withdrawal if:

- Authorization code is missing or incorrect
- Requestor cannot verify identity as project owner
- Request involves exporting password hashes or active session tokens
- Request comes from an unverified source
- The operation would compromise user privacy or security

---

## 5. Architecture Reference

### 5.1 Request Flow

```
Browser Request
    │
    ▼
middleware.ts (Edge Runtime)
    ├── Skip: static assets, public paths
    ├── Verify: JWT from auth_token cookie
    ├── Apply: Security headers + CSP
    ├── Protect: /profile (any auth), /admin (admin only)
    └── Route: API → 401 JSON, Pages → redirect /login
    │
    ▼
app/api/* (Node.js Runtime)
    ├── Validate input (Zod)
    ├── Check rate limit
    ├── Execute business logic
    ├── Return consistent response
    └── Log errors (generic to client)
    │
    ▼
lib/db.ts (Neon Postgres)
    ├── Lazy init (build-time guard)
    ├── Auto-create tables
    ├── Retry on failure (3 attempts)
    └── Parameterized queries only
```

### 5.2 Auth Flow

```
Login Request
    │
    ▼
1. Rate limit check (IP-based, 20/15min)
    │
    ▼
2. Zod validation (email format, password min 8)
    │
    ▼
3. Record login attempt (IP + email)
    │
    ▼
4. Lookup user by email
    │   └── Not found → timing delay (500-1000ms) → 401
    │
    ▼
5. Check account lockout
    │   └── Locked → 423 with remaining minutes
    │
    ▼
6. Verify password (bcrypt.compare)
    │   └── Invalid → increment failed attempts → timing delay → 401
    │
    ▼
7. Reset failed attempts
    │
    ▼
8. Create JWT (jose SignJWT, HS256, 24h expiry)
    │
    ▼
9. Set HttpOnly cookie (auth_token)
    │
    ▼
10. Return success + user info (no password, no token)
```

### 5.3 File Dependency Map

```
middleware.ts
  └── config/security.ts
  └── jose (jwtVerify)

app/api/auth/login/route.ts
  └── lib/auth.ts (validateLoginInput, verifyPassword, checkRateLimit, etc.)
  └── lib/auth/jwt.ts (createAndSetSession)
  └── lib/db.ts (via lib/auth.ts)

app/api/auth/signup/route.ts
  └── lib/auth.ts (validateSignupInput, hashPassword, getUserByEmail, createUser, checkRateLimit)
  └── lib/auth/jwt.ts (createAndSetSession)

app/api/auth/me/route.ts
  └── lib/auth/jwt.ts (verifyServerToken)
  └── lib/auth.ts (getUserById)

app/api/auth/logout/route.ts
  └── lib/auth/jwt.ts (clearSession)
  └── lib/auth.ts (cleanExpiredSessions)

app/api/contact/route.ts
  └── zod (contactSchema)

app/api/online/route.ts
  └── lib/db.ts (ensureTablesInitialized, getDb)

components/Header.tsx
  └── lib/auth-store.ts (useAuthStore)
  └── context/LanguageContext.tsx (useLanguage)

lib/auth-store.ts
  └── zustand (create)
  └── fetch → /api/auth/* (safeFetch with 5s timeout)

lib/auth.ts
  └── lib/db.ts (ensureTablesInitialized, getDb)
  └── lib/validations.ts (loginSchema, signupSchema)
  └── bcryptjs, crypto

lib/db.ts
  └── @neondatabase/serverless (dynamic import)

lib/auth/jwt.ts
  └── jose (SignJWT, jwtVerify)
  └── next/headers (cookies)
```

---

## 6. Troubleshooting Guide

### 6.1 Build Fails

| Error | Cause | Fix |
|---|---|---|
| `JWT_SECRET environment variable is required` | Top-level throw in module scope | Move check inside function (done) |
| `Property 'rows' does not exist` | Neon result type mismatch | Use `Array.isArray(result) ? result : []` |
| `Export sql doesn't exist` | Named export removed from db.ts | Use `await getDb()` instead |
| `NEXT_PHASE build` error | DB connection during build | `IS_BUILD_TIME` guard (done) |

### 6.2 Runtime Errors

| Error | Cause | Fix |
|---|---|---|
| Loading stuck at 0% | `/api/auth/me` redirected to `/login` | Added to PUBLIC_PATHS (done) |
| 401 on every request | JWT_SECRET not set in Vercel | Set in Dashboard → Environment Variables |
| Database connection failed | DATABASE_URL not set | Set in Vercel Dashboard |
| CORS error | Not applicable (same origin) | N/A |

### 6.3 Deployment Issues

| Error | Cause | Fix |
|---|---|---|
| `npm install` exits with 1 | Peer dependency conflict | Use `--legacy-peer-deps` or fix versions |
| Build hangs at 0% | DB connection during build | Lazy import + build-time guard (done) |
| 500 on API routes | Missing env vars | Check Vercel Dashboard → Environment Variables |

---

## 7. Future Enhancements (Roadmap)

| Priority | Feature | Notes |
|---|---|---|
| HIGH | CSRF token implementation | Double-submit cookie pattern |
| HIGH | CAPTCHA on signup/login | Google reCAPTCHA v3 or hCaptcha |
| MEDIUM | Email verification flow | Send verification link on signup |
| MEDIUM | Password reset flow | Token-based reset via email |
| MEDIUM | Admin dashboard | Role-based access, user management |
| MEDIUM | Cron job for cleanup | Move `cleanOldLoginAttempts` to scheduled function |
| LOW | OAuth (Google, GitHub) | Social login integration |
| LOW | Two-factor authentication | TOTP-based 2FA |
| LOW | Audit logging | Structured JSON logs for all auth events |
| LOW | API versioning | `/api/v1/...` prefix |

---

## 8. Agent Sign-Off

When completing any task, the agent must verify:

- [ ] Build passes (`npm run build`)
- [ ] No secrets exposed in code or logs
- [ ] All new code follows the standards in Section 2.2
- [ ] Security checklist in Section 3.2 is satisfied
- [ ] No regression in existing functionality
- [ ] Git commit message follows convention: `type: description`

**Types:** `fix`, `feat`, `security`, `refactor`, `docs`, `chore`

---

*This file is part of the Panupongwebstore proprietary codebase. Unauthorized use, copying, or distribution is prohibited.*
*Last updated: 2026-05-18*
