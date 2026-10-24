const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const pg = require('pg');
const { Client } = pg;

console.log('=== Testing database connection ===');

// Try embedded Postgres first
const client = new Client({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/retailer_dropshipping?schema=public'
});

client.connect()
  .then(() => {
    console.log('Connected to embedded Postgres!');
    return client.query('SELECT current_database(), current_user');
  })
  .then((r) => {
    console.log('DB:', r.rows[0]);
    client.end();
  })
  .catch((err) => {
    console.error('Embedded Postgres connection failed:', err.message);
    // Try to initialize manually
    console.log('Trying to initialize Postgres manually...');
    const initdb = path.join(__dirname, 'node_modules', '@embedded-postgres', 'windows-x64', 'native', 'bin', 'initdb.exe');
    const dbDir = path.join(__dirname, '.pgdata');
    if (fs.existsSync(initdb) && fs.existsSync(dbDir)) {
      try {
        console.log('Running initdb...');
        const result = execSync(`"${initdb}" -D "${dbDir}"`, { encoding: 'utf8', cwd: __dirname });
        console.log('initdb output:', result);
      } catch (err) {
        console.log('initdb stdout:', err.stdout ? err.stdout.toString() : 'none');
        console.log('initdb stderr:', err.stderr ? err.stderr.toString() : 'none');
      }
    } else {
      console.log('initdb not found or dbDir not found');
    }
  });
