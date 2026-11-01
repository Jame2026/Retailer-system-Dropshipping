import { readdir, readFile } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const ignoredDirectories = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.next',
]);
const sourceExtensions = new Set([
  '.css', '.html', '.js', '.json', '.jsx', '.mjs', '.prisma', '.sql',
  '.ts', '.tsx', '.yaml', '.yml',
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

const files = await collectSourceFiles(projectRoot);
const rows = await Promise.all(files.map(async (file) => {
  const counts = countLines(await readFile(file, 'utf8'));
  return { file: relative(projectRoot, file).split(sep).join('/'), ...counts };
}));

rows.sort((a, b) => a.file.localeCompare(b.file));
const width = Math.max(4, ...rows.map(({ total }) => String(total).length));

for (const row of rows) {
  console.log(`${String(row.total).padStart(width)} total | ${String(row.nonEmpty).padStart(width)} non-empty | ${row.file}`);
}

const totals = rows.reduce(
  (result, row) => ({ total: result.total + row.total, nonEmpty: result.nonEmpty + row.nonEmpty }),
  { total: 0, nonEmpty: 0 },
);
console.log(`\n${rows.length} files | ${totals.total} total lines | ${totals.nonEmpty} non-empty lines`);
