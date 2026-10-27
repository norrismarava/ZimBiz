# ZimBiz Connect — agent notes

## Environment quirks (this machine)

- **Outbound TCP 5432 is blocked** (ISP/network level — verified 2026-10-27; Neon reachable on 443 only).
  - `prisma migrate dev`, `db push`, `db pull`, `prisma studio` CANNOT connect locally — they need 5432.
  - DB access locally works only via `@neondatabase/serverless` (WebSocket/443) — that's why `src/lib/prisma.ts` and `prisma/seed.ts` use `PrismaNeon`, not `PrismaPg`.
- **`.exe` files under `node_modules` can't be spawned** (sandbox/AV): esbuild/`tsx` fail (`spawn UNKNOWN`).
  - Run TS scripts with `jiti` instead: `npx jiti prisma/seed.ts` (already wired in `npm run db:seed`).
- Writes under `C:\Users\Norris\Documents` may be blocked until write scope is granted.

## DB workflow (because 5432 is blocked)

To apply a schema change locally:

```bash
# 1. Generate SQL offline (no DB connection needed)
npx prisma migrate diff --from-schema prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script
#    (for a new migration: --from-config-datasource won't work offline; diff --from-schema vs --to-schema)

# 2. Put it in prisma/migrations/<timestamp>_<name>/migration.sql

# 3. Apply over port 443 and record in _prisma_migrations
npm run db:apply -- <migration_name>
```

`prisma migrate deploy` runs on Render at build time (Render's network allows 5432) — keep `prisma/migrations/` in git.

## Commands

- `npm run dev` / `build` / `start` — Next.js 16 (Turbopack)
- `npm run db:generate` — prisma generate (client → `src/generated/prisma`, gitignored)
- `npm run db:seed` — seed via jiti
- `npm run db:apply <name>` — apply a migration file to Neon over 443
- `npx jiti <file.ts>` — run any TS script locally (tsx/esbuild broken on this machine)

## Deploy (Render)

- `render.yaml` blueprint: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`, start `npm run start`
- Env vars needed on Render: `DATABASE_URL` (Neon string), `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (the Render URL)
- Seed demo accounts exist (password `Password123`): admin@/officer@/customer@/owner1-4@zimbiz.co.zw

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
