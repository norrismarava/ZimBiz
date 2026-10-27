// Applies prisma/migrations/<name>/migration.sql to Neon over the
// serverless (WebSocket/443) driver, then records it in _prisma_migrations
// so `prisma migrate deploy`/`dev` sees it as applied.
// Usage: node scripts/apply-migration.mjs <migration_name>
import { readFileSync } from "node:fs";
import { createHash, randomUUID } from "node:crypto";
import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";
import "dotenv/config";

neonConfig.webSocketConstructor = ws;

const name = process.argv[2];
if (!name) {
  console.error("usage: node scripts/apply-migration.mjs <migration_name>");
  process.exit(1);
}

const sql = readFileSync(`prisma/migrations/${name}/migration.sql`, "utf8");
const checksum = createHash("sha256").update(sql).digest("hex");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

try {
  console.log(`Applying ${name} (${sql.length} bytes) over 443...`);
  await pool.query(sql);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id"                  VARCHAR(36) PRIMARY KEY NOT NULL,
      "checksum"            VARCHAR(64) NOT NULL,
      "finished_at"         TIMESTAMPTZ,
      "migration_name"      VARCHAR(255) NOT NULL,
      "logs"                TEXT,
      "rolled_back_at"      TIMESTAMPTZ,
      "started_at"          TIMESTAMPTZ NOT NULL DEFAULT now(),
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    );
  `);

  const { rows } = await pool.query(
    `SELECT id FROM "_prisma_migrations" WHERE migration_name = $1`,
    [name]
  );
  if (rows.length === 0) {
    await pool.query(
      `INSERT INTO "_prisma_migrations"
         (id, checksum, migration_name, finished_at, applied_steps_count)
       VALUES ($1, $2, $3, now(), 1)`,
      [randomUUID(), checksum, name]
    );
  }
  console.log("Done — migration applied and recorded.");
} finally {
  await pool.end();
}
