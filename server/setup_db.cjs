const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Kill any existing postgres processes
try {
  execSync('pkill -9 postgres 2>/dev/null || true');
  console.log('Killed stale postgres processes');
} catch (e) {
  console.log('No stale processes to kill');
}

// Remove .pgdata
const dbDir = path.join(__dirname, '.pgdata');
if (fs.existsSync(dbDir)) {
  console.log('Removing .pgdata...');
  execSync('rm -rf ' + dbDir, { cwd: __dirname });
  console.log('Removed .pgdata');
}

// Verify removal
console.log('Exists after removal:', fs.existsSync(dbDir));

// Run initdb
const initdb = path.join(__dirname, 'node_modules', '@embedded-postgres', 'windows-x64', 'native', 'bin', 'initdb.exe');
if (fs.existsSync(initdb)) {
  console.log('Running initdb...');
  try {
    const result = execSync('"' + initdb + '" -D "' + dbDir + '"', { encoding: 'utf8', cwd: __dirname });
    console.log('initdb result:', result);
  } catch (err) {
    console.log('initdb stdout:', err.stdout ? err.stdout.toString() : 'none');
    console.log('initdb stderr:', err.stderr ? err.stderr.toString() : 'none');
    console.log('initdb error:', err.message);
  }
}

// Check result
if (fs.existsSync(path.join(dbDir, 'global', 'pg_control'))) {
  console.log('SUCCESS: pg_control found!');
} else {
  console.log('FAILURE: pg_control not found');
  console.log('Contents of .pgdata:', fs.readdirSync(dbDir).join(', '));
}
