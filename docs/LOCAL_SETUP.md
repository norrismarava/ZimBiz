# Run ZimBiz Connect Locally

Next.js 16 app — frontend + API (backend) run in ONE process. The only
external dependency is the database (Neon cloud **or** a local Postgres).

## Prerequisites

| Need | Why | Get it |
|------|-----|--------|
| Node.js ≥ 22 | runs everything | nodejs.org |
| Git | clone the repo | git-scm.com |

## Setup (one time)

```bash
git clone https://github.com/norrismarava/ZimBiz.git
cd ZimBiz            # repo root = the app (package.json is here)
npm install          # also runs `prisma generate` via postinstall
```

Copy `.env.example` → `.env` and fill in `DATABASE_URL` (see options below).

## Option A — Neon database (needs internet, recommended)

This is what production uses. It works locally too — the app talks to Neon
over port 443 via the serverless adapter, so the local 5432 block doesn't
matter.

```env
DATABASE_URL="postgresql://neondb_owner:PASSWORD@ep-xxxx-pooler.xxxx.aws.neon.tech/neondb?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="any-random-string"
```

DB is already migrated + seeded — nothing else to do.

## Option B — Local Postgres (works fully OFFLINE)

1. Install PostgreSQL (postgresql.org → Windows installer, or `winget install PostgreSQL.PostgreSQL`).
2. Create the database:
   ```bash
   psql -U postgres -c "CREATE DATABASE zimbiz_connect;"
   ```
3. `.env` → point at it (note: `localhost`, not Neon):
   ```env
   DATABASE_URL="postgresql://postgres:YOURPASSWORD@localhost:5432/zimbiz_connect?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="any-random-string"
   ```
4. Create tables + seed:
   ```bash
   npx prisma migrate deploy     # applies prisma/migrations/*
   npm run db:seed               # roles, 18 categories, 36 demo businesses, plans
   ```

The app auto-selects the adapter from the URL: `neon.tech` → Neon adapter,
anything else → `pg` driver. No code changes needed.

## Run

```bash
npm run dev        # dev server → http://localhost:3000
# or production mode:
npm run build && npm run start
```

Open **http://localhost:3000**.

## Demo logins (password: `Password123`)

| Role | Email | See |
|------|-------|-----|
| Admin | `admin@zimbiz.co.zw` | Dashboard → "Platform Admin" → revenue console |
| Officer | `officer@zimbiz.co.zw` | Verification reviews |
| Customer | `customer@zimbiz.co.zw` | Requests, quotes |
| Owners | `owner1@zimbiz.co.zw` … `owner36@zimbiz.co.zw` | Business dashboards |

## Useful commands

| Command | Does |
|---------|------|
| `npm run dev` | dev server (hot reload) |
| `npm run build` | production build (runs `prisma generate` first) |
| `npm run start` | serve the production build |
| `npm run db:seed` | re-seed (safe, idempotent — skips existing) |
| `npm run db:migrate` | `prisma migrate dev` — needs reachable 5432 (local PG only) |
| `npm run db:apply <name>` | apply a migration file to Neon over 443 |
| `npx jiti <file.ts>` | run any TS script (tsx/esbuild broken on this machine) |
| `npm run lint` | eslint |

## Machine quirks (documented in AGENTS.md)

- Outbound **5432 blocked** by ISP → `migrate dev`/`db push`/`studio` fail
  against *remote* DBs. Local Postgres on `localhost:5432` is unaffected.
- `.exe` under `node_modules` can't spawn → `tsx`/`esbuild` fail; use `jiti`.
