/**
 * Local development PostgreSQL (embedded, no system install required).
 *
 * Usage: npm run db:start   (from the server/ directory)
 *
 * Creates/starts a Postgres 18 cluster stored in server/.pgdata on port 5432
 * with user/password `postgres`, and ensures the `retailer_dropshipping`
 * database from .env exists. Keeps running until interrupted (Ctrl+C).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import EmbeddedPostgres from 'embedded-postgres';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const databaseDir = path.join(__dirname, '..', '.pgdata');
const DB_NAME = process.env.DB_NAME || 'retailer_dropshipping';

const pg = new EmbeddedPostgres({
  databaseDir,
  user: 'postgres',
  password: 'postgres',
  port: Number(process.env.PG_PORT || 5432),
  persistent: true,
});

async function main() {
  const alreadyInitialised = fs.existsSync(path.join(databaseDir, 'PG_VERSION'));

  if (!alreadyInitialised) {
    console.log(`Initialising new Postgres cluster at ${databaseDir} ...`);
    await pg.initialise();
  }

  console.log('Starting embedded PostgreSQL ...');
  await pg.start();

  const client = pg.getPgClient();
  await client.connect();
  const { rows } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [DB_NAME]);
  if (rows.length === 0) {
    console.log(`Creating database "${DB_NAME}" ...`);
    await pg.createDatabase(DB_NAME);
  } else {
    console.log(`Database "${DB_NAME}" already exists.`);
  }
  await client.end();

  console.log('✅ PostgreSQL ready at postgresql://postgres:postgres@localhost:5432/' + DB_NAME);
  console.log('   Press Ctrl+C to stop.');
}

const shutdown = async () => {
  try {
    await pg.stop();
  } catch {
    /* already stopped */
  }
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

main().catch(async (err) => {
  console.error('Failed to start embedded PostgreSQL:', err.message);
  await shutdown();
  process.exit(1);
});
