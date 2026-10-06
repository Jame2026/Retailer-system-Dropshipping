/**
 * Read-only inspection of the configured database.
 * Usage: node scripts/inspectDb.mjs
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRawUnsafe(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`
  );

  console.log(`Tables in public schema: ${tables.length}`);
  for (const t of tables) {
    const name = t.table_name;
    try {
      const rows = await prisma.$queryRawUnsafe(`SELECT count(*) AS n FROM "${name}"`);
      console.log(`  ${name}: ${rows[0].n} row(s)`);
    } catch (e) {
      console.log(`  ${name}: (count failed: ${e.message})`);
    }
  }

  const migrations = await prisma.$queryRawUnsafe(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = '_prisma_migrations'`
  );
  console.log(`_prisma_migrations table present: ${migrations.length > 0}`);
  if (migrations.length > 0) {
    const applied = await prisma.$queryRawUnsafe(`SELECT migration_name, finished_at FROM "_prisma_migrations" ORDER BY started_at`);
    for (const m of applied) console.log(`  - ${m.migration_name} (finished: ${m.finished_at})`);
  }
}

main()
  .catch((e) => {
    console.error('ERROR:', e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
