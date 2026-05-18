# Panupongwebstore

> Premium Digital Solutions & Design Services — Full-Stack Portfolio Platform

## Project Overview

A modern, secure, production-ready Next.js 16 portfolio and freelance platform with full authentication, rate limiting, and enterprise-grade security headers. Built for deployment on Vercel with Neon Postgres.

**Repository:** `https://github.com/artxi8090-boop/PANUPONGWEBSTORE.git`
**Framework:** Next.js 16.2.6 (App Router + Turbopack)
**Runtime:** Node.js (serverless on Vercel)
**Database:** Neon Postgres (serverless)
**Auth:** JWT via `jose` (Edge-compatible) + HttpOnly cookies

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│  React 19 + Framer Motion + Three.js + Zustand (state)      │
│  HttpOnly cookies only — NO raw tokens in JS memory          │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL EDGE / SERVERLESS                  │
│                                                              │
│  middleware.ts (Edge Runtime)                                │
│  ├── Security Headers (CSP, HSTS, X-Frame, etc.)            │
│  ├── JWT Verification via jose (HS256)                      │
│  ├── Route Protection (/profile, /admin)                    │
│  └── API vs Page route handling (401 JSON vs redirect)      │
│                                                              │
│  app/api/* (Node.js Runtime)                                 │
│  ├── /api/auth/login   — Rate limit + lockout + timing      │
│  ├── /api/auth/signup  — Zod validation + bcrypt(12)        │
│  ├── /api/auth/me      — JWT verify + user lookup           │
│  ├── /api/auth/logout  — Cookie + session cleanup           │
│  ├── /api/contact      — Zod + HTML escaping + Resend       │
│  ├── /api/online       — Neon Postgres upsert               │
│  └── /api/projects     — Static project list                │
│                                                              │
│  app/* (Static/SSR Pages)                                    │
│  ├── / (Home)         — Hero, Services, Portfolio, Contact  │
│  ├── /about           — Creator profile, skills, tech stack │
│  ├── /contact         — Multi-step code-editor form         │
│  ├── /login           — Auth form with Zod validation       │
│  ├── /signup          — Auth form with role selection       │
│  └── /profile         — Protected user profile page         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    NEON POSTGRES (Serverless)                │
│                                                              │
│  users              — Auth accounts, lockout state           │
│  login_attempts     — Rate limiting by IP + email           │
│  sessions           — JWT session tracking                  │
│  online_users       — Real-time visitor counter             │
└─────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
web รับออกแบบงาน/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (ClientLayout + LanguageProvider)
│   ├── page.tsx                  # Home page
│   ├── (auth)/                   # Auth route group
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── profile/page.tsx          # Protected profile page
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   └── api/                      # API routes (Node.js runtime)
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── signup/route.ts
│       │   ├── logout/route.ts
│       │   └── me/route.ts
│       ├── contact/route.ts
│       ├── online/route.ts
│       └── projects/route.ts
│
├── components/                   # React UI components
│   ├── ClientLayout.tsx          # Loading screen wrapper
│   ├── Header.tsx                # Navigation + auth state
│   ├── Footer.tsx
│   ├── LoadingScreen.tsx         # Animated 2s loading overlay
│   ├── LanguageSwitcher.tsx
│   ├── ContactForm.tsx
│   ├── CodeContactForm.tsx
│   ├── HeroSection.tsx
│   ├── Hero3DBackground.tsx
│   ├── Portfolio3DCard.tsx
│   ├── Service3DCard.tsx
│   ├── TiltCard.tsx
│   ├── RatingSystem.tsx
│   ├── sections/
│   │   ├── Portfolio.tsx
│   │   └── Services.tsx
│   └── ui/                       # shadcn-style primitives
│       ├── button.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── textarea.tsx
│
├── config/                       # Security configuration (single source of truth)
│   └── security.ts               # Security headers + strict CSP generator
│
├── context/
│   └── LanguageContext.tsx       # i18n (en/th/zh) with localStorage
│
├── lib/                          # Server-side business logic
│   ├── auth.ts                   # Auth logic (bcrypt, rate limit, lockout, user CRUD)
│   ├── db.ts                     # Neon Postgres singleton + table init + retry
│   ├── validations.ts            # Zod schemas (login, signup)
│   ├── auth-store.ts             # Zustand client state (NO raw tokens)
│   ├── translations.ts           # i18n dictionary (454 lines)
│   ├── utils.ts                  # cn() utility
│   └── auth/
│       └── jwt.ts                # JWT sign/verify via jose + cookie management
│
├── src/                          # Legacy auth components (duplicates — safe to remove)
│   ├── components/auth/
│   │   ├── AuthLayout.tsx
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── lib/auth-store.ts         # Duplicate of lib/auth-store.ts
│   └── styles/auth.css
│
├── public/                       # Static assets
│   ├── logo.png
│   └── images/
│
├── styles/
│   └── globals.css               # Tailwind + custom neon theme
│
├── middleware.ts                 # Edge middleware (security + auth guard)
├── next.config.mjs               # Next.js config (security: no source maps)
├── tailwind.config.js            # Neon theme (cyan/pink)
├── postcss.config.js
├── tsconfig.json                 # Strict mode, path aliases
├── .env.example                  # Environment variable template
├── .env.local                    # Local secrets (gitignored)
├── .gitignore
├── package.json
└── AGENTS.md                     # AI agent instructions (this file's companion)
```

---

## Security Architecture

### Defense Layers

| Layer | Mechanism | Implementation |
|---|---|---|
| **1. Edge Gateway** | Security Headers | `middleware.ts` — CSP, HSTS, X-Frame DENY, nosniff, Permissions-Policy |
| **2. Auth Guard** | JWT Verification | `middleware.ts` — `jose.jwtVerify()` on every protected route |
| **3. Cookie Security** | HttpOnly + Secure + SameSite=Strict | `lib/auth/jwt.ts` — tokens never touch client JS |
| **4. Rate Limiting** | IP-based (20 req / 15 min) | `lib/auth.ts` — `checkRateLimit()` on login + signup |
| **5. Account Lockout** | 5 failed attempts → 15 min lock | `lib/auth.ts` — `incrementFailedAttempts()` + `checkAccountLockout()` |
| **6. Timing Attack Mitigation** | Random 500-1000ms delay | `app/api/auth/login/route.ts` — prevents username enumeration |
| **7. Input Validation** | Zod schemas | `lib/validations.ts` — email, password complexity, max lengths |
| **8. XSS Prevention** | HTML entity escaping | `app/api/contact/route.ts` — `escapeHtml()` on all user input in emails |
| **9. SQL Injection** | Parameterized queries | `@neondatabase/serverless` template literals — never string concatenation |
| **10. Password Hashing** | bcrypt with 12 rounds | `lib/auth.ts` — `BCRYPT_ROUNDS = 12` |
| **11. CSP** | Strict (no unsafe-eval) | `config/security.ts` — `'self'` only, `'unsafe-inline'` for styles (framer-motion) |
| **12. Source Map Protection** | Disabled in production | `next.config.mjs` — `productionBrowserSourceMaps: false` |
| **13. Image SSRF Prevention** | Whitelisted domains only | `next.config.mjs` — only `images.unsplash.com` + `avatars.githubusercontent.com` |
| **14. Build-Time Isolation** | No DB connection during build | `lib/db.ts` — `IS_BUILD_TIME` guard + lazy neon import |

### Cookie Specification

| Attribute | Value | Reason |
|---|---|---|
| Name | `auth_token` | Clear naming convention |
| HttpOnly | `true` | Prevents XSS token theft |
| Secure | `true` (production) | HTTPS only |
| SameSite | `strict` | CSRF protection |
| Path | `/` | Available site-wide |
| MaxAge | `86400` (24 hours) | Short expiration limits damage |

### JWT Payload Structure

```json
{
  "sub": "user-id-hex",
  "email": "user@example.com",
  "role": "client | freelancer | admin",
  "iat": 1716000000,
  "exp": 1716086400
}
```

Algorithm: `HS256` | Secret: `process.env.JWT_SECRET` (min 32 chars)

---

## Database Schema

### users

| Column | Type | Constraints |
|---|---|---|
| id | TEXT | PRIMARY KEY |
| name | TEXT | NOT NULL |
| email | TEXT | UNIQUE NOT NULL |
| password_hash | TEXT | NOT NULL |
| role | TEXT | CHECK(role IN ('client', 'freelancer', 'admin')) |
| email_verified | BOOLEAN | DEFAULT false |
| is_locked | BOOLEAN | DEFAULT false |
| locked_until | BIGINT | DEFAULT 0 |
| failed_login_attempts | INTEGER | DEFAULT 0 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

### login_attempts

| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| ip_address | TEXT | NOT NULL |
| email | TEXT | nullable |
| attempted_at | TIMESTAMPTZ | DEFAULT NOW() |

### sessions

| Column | Type | Constraints |
|---|---|---|
| id | TEXT | PRIMARY KEY |
| user_id | TEXT | FK → users(id) ON DELETE CASCADE |
| token_hash | TEXT | NOT NULL |
| expires_at | BIGINT | NOT NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

### online_users

| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| session_id | TEXT | UNIQUE NOT NULL |
| last_seen | BIGINT | NOT NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

---

## API Contracts

### POST /api/auth/login

**Request:**
```json
{ "email": "user@example.com", "password": "SecurePass1!" }
```

**Response 200:**
```json
{ "success": true, "message": "Login successful", "user": { "id": "...", "name": "...", "email": "...", "role": "client" } }
```

**Response 400:** Validation error
**Response 401:** Invalid credentials (generic — no enum hint)
**Response 423:** Account locked
**Response 429:** Rate limited

### POST /api/auth/signup

**Request:**
```json
{ "name": "John Doe", "email": "john@example.com", "password": "SecurePass1!", "role": "client" }
```

**Response 201:** Account created
**Response 400:** Validation error
**Response 409:** Email already exists
**Response 429:** Rate limited

### GET /api/auth/me

**Request:** Cookie `auth_token` required

**Response 200:** `{ "success": true, "user": { ... } }`
**Response 401:** Not authenticated

### POST /api/auth/logout

**Response 200:** `{ "success": true, "message": "Logged out successfully" }`

### POST /api/contact

**Request:**
```json
{ "name": "John", "email": "john@example.com", "message": "Hello!" }
```

**Response 200:** `{ "success": true, "message": "Message sent successfully", "provider": "resend" | "mock" }`
**Response 400:** Validation error
**Response 500:** Internal error

### GET /api/online

**Response 200:** `{ "online": 5 }`

### POST /api/online

**Request:** `{ "sessionId": "uuid" }`
**Response 200:** `{ "online": 5 }`

### GET /api/projects

**Response 200:** `{ "total": 1, "realProjects": 1, "projects": [...] }`

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | YES | Min 32 chars. Generate: `openssl rand -base64 32` |
| `DATABASE_URL` or `POSTGRES_URL` | YES | Neon Postgres connection string with `?sslmode=require` |
| `RESEND_API_KEY` | Optional | Email service API key (contact form) |
| `CONTACT_EMAIL` | Optional | Destination email for contact form |
| `NODE_ENV` | Auto | `development` or `production` |

---

## Deployment

### Vercel Setup

1. Connect GitHub repository: `artxi8090-boop/PANUPONGWEBSTORE`
2. Set Environment Variables in Vercel Dashboard:
   - `JWT_SECRET` — generate with `openssl rand -base64 32`
   - `DATABASE_URL` — from Neon Console → Connection Details
3. Deploy — auto-triggers on push to `main`

### Build Command

```bash
npm run build
```

### Start Command

```bash
npm start
```

### Local Development

```bash
cp .env.example .env.local
# Fill in JWT_SECRET and DATABASE_URL
npm run dev
```

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16.2.6 (App Router) |
| Language | TypeScript 6.0.3 (strict mode) |
| UI | React 19, Tailwind CSS 3.4, Radix UI |
| Animation | Framer Motion 12, Lottie React, Three.js + React Three Fiber + Drei |
| Auth | jose 6 (JWT), bcryptjs 3 (password hashing) |
| Database | Neon Postgres via @neondatabase/serverless 1.1 |
| Validation | Zod 4 |
| State | Zustand 5 (client only, no raw tokens) |
| Email | Resend API |
| i18n | Custom context (en/th/zh) |
| Linting | ESLint 9 + eslint-config-next |

---

## Known Limitations

1. **SQLite data directory** (`data/`) is legacy — no longer used, safe to delete
2. **`src/` directory** contains duplicate auth components — safe to remove
3. **No CSRF tokens** — mitigated by SameSite=strict cookies
4. **No CAPTCHA** — rate limiting provides basic bot protection
5. **`cleanOldLoginAttempts`** runs on every login — should be cron-based in production
6. **Middleware deprecation warning** — Next.js 16 prefers `proxy` over `middleware`

---

## License

Private — All rights reserved.
