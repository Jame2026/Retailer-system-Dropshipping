const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const initdb = path.join(__dirname, 'node_modules', '@embedded-postgres', 'windows-x64', 'native', 'bin', 'initdb.exe');
const dbDir = path.join(__dirname, '.pgdata');

console.log('initdb exists:', fs.existsSync(initdb));
console.log('dbDir:', dbDir);

if (fs.existsSync(initdb)) {
  try {
    console.log('Running initdb -D ' + dbDir);
    const result = execSync('"' + initdb + '" -D "' + dbDir + '"', { encoding: 'utf8', cwd: __dirname });
    console.log('initdb result:', result);
  } catch (err) {
    console.log('initdb stdout:', err.stdout ? err.stdout.toString() : 'none');
    console.log('initdb stderr:', err.stderr ? err.stderr.toString() : 'none');
    console.log('initdb error:', err.message);
  }
}
