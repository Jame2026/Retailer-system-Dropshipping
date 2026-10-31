import fs from 'fs';
import path from 'path';

function checkDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (f === 'node_modules' || f === 'dist' || f === '.git' || f === 'prisma') continue;
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      checkDir(full);
    } else if (f.endsWith('.ts') || f.endsWith('.tsx')) {
      const content = fs.readFileSync(full, 'utf-8');
      const lines = content.split('\n').length;
      if (lines > 200) {
        console.log(`EXCEEDS 200: ${full} (${lines} lines)`);
      }
    }
  }
}

console.log('Checking client/src...');
checkDir('client/src');
console.log('Checking server...');
checkDir('server');
console.log('Done check.');
