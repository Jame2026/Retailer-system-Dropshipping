import fs from 'fs';
import path from 'path';
import {
  formatNames,
  getServiceContent,
  getControllerContent,
  getRouteContent,
} from './make.templates.js';

const serverRoot = path.resolve(process.cwd(), 'server');
const effectiveRoot = fs.existsSync(path.join(serverRoot, 'prisma')) ? serverRoot : process.cwd();

export { formatNames };

export function createService(name: string) {
  const names = formatNames(name);
  const targetPath = path.join(effectiveRoot, 'services', `${names.kebab}.service.ts`);

  if (fs.existsSync(targetPath)) {
    console.log(`⚠️  Service already exists at: services/${names.kebab}.service.ts`);
    return targetPath;
  }

  fs.writeFileSync(targetPath, getServiceContent(names), 'utf-8');
  console.log(`✅ [Service] Created: server/services/${names.kebab}.service.ts`);
  return targetPath;
}

export function createController(name: string) {
  const names = formatNames(name);
  const targetPath = path.join(effectiveRoot, 'controllers', `${names.kebab}.controller.ts`);

  if (fs.existsSync(targetPath)) {
    console.log(`⚠️  Controller already exists at: controllers/${names.kebab}.controller.ts`);
    return targetPath;
  }

  fs.writeFileSync(targetPath, getControllerContent(names), 'utf-8');
  console.log(`✅ [Controller] Created: server/controllers/${names.kebab}.controller.ts`);
  return targetPath;
}

export function createRoute(name: string) {
  const names = formatNames(name);
  const targetPath = path.join(effectiveRoot, 'routes', 'api', `${names.kebab}.routes.ts`);

  if (fs.existsSync(targetPath)) {
    console.log(`⚠️  Route already exists at: routes/api/${names.kebab}.routes.ts`);
    return targetPath;
  }

  fs.writeFileSync(targetPath, getRouteContent(names), 'utf-8');
  console.log(`✅ [Route] Created: server/routes/api/${names.kebab}.routes.ts`);
  return targetPath;
}

export function appendModelIfMissing(name: string) {
  const { pascal } = formatNames(name);
  const schemaPath = path.join(effectiveRoot, 'prisma', 'schema.prisma');
  if (!fs.existsSync(schemaPath)) return;

  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  const modelRegex = new RegExp(`model\\s+${pascal}\\s+\\{`, 'i');

  if (!modelRegex.test(schemaContent)) {
    const modelTemplate = `\nmodel ${pascal} {\n  id        String   @id @default(uuid())\n  title     String?\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n`;
    fs.appendFileSync(schemaPath, modelTemplate, 'utf-8');
    console.log(`✅ [Model] Added 'model ${pascal}' to server/prisma/schema.prisma`);
  } else {
    console.log(`ℹ️  [Model] 'model ${pascal}' already exists in schema.prisma`);
  }
}

const args = process.argv.slice(2);
const command = args[0];
const targetName = args[1];

if (!command || !targetName) {
  console.log(`
🛠️  Dropship System Scaffolding CLI (Laravel-style Artisan Generators)

Usage:
  npm run make:all -- <Name>         # Creates Model + Service + Controller + Route
  npm run make:controller -- <Name>  # Creates Controller
  npm run make:service -- <Name>     # Creates Service
  npm run make:route -- <Name>       # Creates Route

Examples:
  npm run make:all -- Product
  npm run make:all -- CustomerReview
  npm run make:controller -- OrderNotification
`);
  process.exit(0);
}

console.log(`\n🚀 Generating ${command} for: ${targetName}...\n`);

switch (command) {
  case 'controller':
    createController(targetName);
    break;
  case 'service':
    createService(targetName);
    break;
  case 'route':
    createRoute(targetName);
    break;
  case 'all':
  case 'resource':
  default:
    appendModelIfMissing(targetName);
    createService(targetName);
    createController(targetName);
    createRoute(targetName);
    console.log(`\n🎉 Resource [${targetName}] generated successfully!`);
    console.log(`💡 Next Steps:`);
    console.log(`   1. Run 'npm run prisma:generate' to update TypeScript types.`);
    console.log(`   2. Mount in server/routes/index.ts: router.use('/api/${formatNames(targetName).pluralKebab}', ${formatNames(targetName).camel}Routes);`);
    break;
}
