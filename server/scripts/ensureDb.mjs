import EmbeddedPostgres from 'embedded-postgres';

const DB_NAME = process.env.DB_NAME || 'retailer_dropshipping';

const pg = new EmbeddedPostgres({
  databaseDir: new URL('../.pgdata', import.meta.url).pathname.slice(1),
  user: 'postgres',
  password: 'postgres',
  port: Number(process.env.PG_PORT || 5432),
  persistent: true,
});

// The library's createDatabase shells out to `createdb`, which the Windows
// binary bundle does not ship. CREATE DATABASE cannot run inside a
// transaction, so it goes straight over the default connection instead.
const client = pg.getPgClient();
await client.connect();
const { rows } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [DB_NAME]);
if (rows.length === 0) {
  const ident = `"${DB_NAME.replace(/"/g, '""')}"`;
  await client.query(`CREATE DATABASE ${ident}`);
  console.log(`created database "${DB_NAME}"`);
} else {
  console.log(`database "${DB_NAME}" already exists`);
}
await client.end();
process.exit(0);
