import { readdir, readFile } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const warningLineLimit = 200;
const failureLineLimit = 250;
const ignoredDirectories = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.next',
]);
const sourceRoots = ['client/src', 'server', 'scripts'];
const sourceExtensions = new Set([
  '.css', '.js', '.jsx', '.mjs', '.prisma', '.sql', '.ts', '.tsx',
]);

function hasSourceExtension(fileName) {
  const extension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
  return sourceExtensions.has(extension);
}

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) files.push(...await collectSourceFiles(path));
    } else if (entry.isFile() && hasSourceExtension(entry.name)) {
      files.push(path);
    }
  }

  return files;
}

function countLines(contents) {
  if (!contents) return { total: 0, nonEmpty: 0 };
  const lines = contents.split(/\r?\n/);
  // A trailing newline terminates the last line; it does not create another line of code.
  if (lines.at(-1) === '') lines.pop();
  return {
    total: lines.length,
    nonEmpty: lines.filter((line) => line.trim().length > 0).length,
  };
}

const files = (await Promise.all(sourceRoots.map((directory) => collectSourceFiles(resolve(projectRoot, directory))))).flat();
const rows = await Promise.all(files.map(async (file) => {
  const counts = countLines(await readFile(file, 'utf8'));
  const filePath = relative(projectRoot, file).split(sep).join('/');
  const group = filePath.startsWith('client/src/') ? 'Client source (client/src)'
    : filePath.startsWith('server/') ? 'Server source (server)'
      : 'Project scripts (scripts)';
  return { file: filePath, group, ...counts };
}));

rows.sort((a, b) => a.group.localeCompare(b.group) || a.file.localeCompare(b.file));
const width = Math.max(4, ...rows.map(({ total }) => String(total).length));

let previousGroup = '';
for (const row of rows) {
  if (row.group !== previousGroup) {
    console.log(`\n${row.group}`);
    previousGroup = row.group;
  }
  const status = row.nonEmpty > failureLineLimit
    ? 'FAILED '
    : row.nonEmpty > warningLineLimit
      ? 'WARNING'
      : 'PASS   ';
  console.log(`${status} | ${String(row.total).padStart(width)} total | ${String(row.nonEmpty).padStart(width)} non-empty | ${row.file}`);
}

const totals = rows.reduce(
  (result, row) => ({ total: result.total + row.total, nonEmpty: result.nonEmpty + row.nonEmpty }),
  { total: 0, nonEmpty: 0 },
);
const groupTotals = rows.reduce((result, row) => {
  const current = result.get(row.group) || { files: 0, total: 0, nonEmpty: 0 };
  current.files += 1;
  current.total += row.total;
  current.nonEmpty += row.nonEmpty;
  result.set(row.group, current);
  return result;
}, new Map());
const warnings = rows.filter((row) => row.nonEmpty > warningLineLimit && row.nonEmpty <= failureLineLimit);
const failures = rows.filter((row) => row.nonEmpty > failureLineLimit);

console.log('\nCode-line totals (package files, lockfiles, docs, and config files excluded)');
for (const [group, counts] of groupTotals) {
  console.log(`- ${group}: ${counts.files} files | ${counts.total} total lines | ${counts.nonEmpty} non-empty lines`);
}
console.log(`- All code: ${rows.length} files | ${totals.total} total lines | ${totals.nonEmpty} non-empty lines`);
console.log(`Limit: warning above ${warningLineLimit} non-empty lines; failure above ${failureLineLimit}.`);

if (failures.length > 0) {
  console.error(`\nLine-count check failed: ${failures.length} file(s) exceed ${failureLineLimit} non-empty lines.`);
  for (const file of failures) {
    console.error(`- ${file.file}: ${file.nonEmpty} non-empty lines`);
  }
  process.exitCode = 1;
} else if (warnings.length > 0) {
  console.warn(`\nLine-count warning: ${warnings.length} file(s) exceed ${warningLineLimit} non-empty lines.`);
  for (const file of warnings) {
    console.warn(`- ${file.file}: ${file.nonEmpty} non-empty lines`);
  }
}
