import fs from 'fs';
import path from 'path';

const serverRoot = path.resolve(process.cwd(), 'server');
const effectiveRoot = fs.existsSync(path.join(serverRoot, 'prisma')) ? serverRoot : process.cwd();

// Helper to convert names
function formatNames(rawName: string) {
  const clean = rawName.replace(/controller|service|model|routes?$/i, '').trim();
  const pascalCase = clean.charAt(0).toUpperCase() + clean.slice(1);
  const camelCase = clean.charAt(0).toLowerCase() + clean.slice(1);
  const kebabCase = camelCase.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  const pluralName = camelCase.endsWith('y') ? camelCase.slice(0, -1) + 'ies' : camelCase + 's';
  const pluralKebab = kebabCase.endsWith('y') ? kebabCase.slice(0, -1) + 'ies' : kebabCase + 's';

  return {
    pascal: pascalCase,
    camel: camelCase,
    kebab: kebabCase,
    plural: pluralName,
    pluralKebab: pluralKebab,
  };
}

// 1. Generate Service
export function createService(name: string) {
  const { pascal, camel, plural, kebab } = formatNames(name);
  const targetPath = path.join(effectiveRoot, 'services', `${kebab}.service.ts`);

  if (fs.existsSync(targetPath)) {
    console.log(`⚠️  Service already exists at: services/${kebab}.service.ts`);
    return targetPath;
  }

  const content = `import { prisma } from '../database/client.js';

export interface Create${pascal}Input {
  [key: string]: any;
}

export interface Update${pascal}Input {
  [key: string]: any;
}

export class ${pascal}Service {
  /**
   * Get all ${plural}
   */
  async getAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const model = (prisma as any).${camel};

    if (!model) {
      throw new Error('Model ${pascal} is not defined in Prisma schema yet.');
    }

    const [items, total] = await Promise.all([
      model.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      model.count(),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Get single ${camel} by ID
   */
  async getById(id: string) {
    const model = (prisma as any).${camel};
    return model.findUnique({ where: { id } });
  }

  /**
   * Create new ${camel}
   */
  async create(data: Create${pascal}Input) {
    const model = (prisma as any).${camel};
    return model.create({ data });
  }

  /**
   * Update existing ${camel}
   */
  async update(id: string, data: Update${pascal}Input) {
    const model = (prisma as any).${camel};
    return model.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete ${camel}
   */
  async delete(id: string) {
    const model = (prisma as any).${camel};
    return model.delete({ where: { id } });
  }
}

export const ${camel}Service = new ${pascal}Service();
`;

  fs.writeFileSync(targetPath, content, 'utf-8');
  console.log(`✅ [Service] Created: server/services/${kebab}.service.ts`);
  return targetPath;
}

// 2. Generate Controller
export function createController(name: string) {
  const { pascal, camel, kebab } = formatNames(name);
  const targetPath = path.join(effectiveRoot, 'controllers', `${kebab}.controller.ts`);

  if (fs.existsSync(targetPath)) {
    console.log(`⚠️  Controller already exists at: controllers/${kebab}.controller.ts`);
    return targetPath;
  }

  const content = `import { Request, Response, NextFunction } from 'express';
import { ${camel}Service } from '../services/${kebab}.service.js';

export class ${pascal}Controller {
  /**
   * GET /api/${kebab}s
   */
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const data = await ${camel}Service.getAll(page, limit);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/${kebab}s/:id
   */
  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const data = await ${camel}Service.getById(id);
      if (!data) {
        return res.status(404).json({ success: false, error: '${pascal} not found' });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * POST /api/${kebab}s
   */
  async store(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ${camel}Service.create(req.body);
      return res.status(201).json({ success: true, message: '${pascal} created successfully', data });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * PUT /api/${kebab}s/:id
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const data = await ${camel}Service.update(id, req.body);
      return res.status(200).json({ success: true, message: '${pascal} updated successfully', data });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * DELETE /api/${kebab}s/:id
   */
  async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      await ${camel}Service.delete(id);
      return res.status(200).json({ success: true, message: '${pascal} deleted successfully' });
    } catch (error) {
      return next(error);
    }
  }
}

export const ${camel}Controller = new ${pascal}Controller();
`;

  fs.writeFileSync(targetPath, content, 'utf-8');
  console.log(`✅ [Controller] Created: server/controllers/${kebab}.controller.ts`);
  return targetPath;
}

// 3. Generate Route
export function createRoute(name: string) {
  const { pascal, camel, kebab } = formatNames(name);
  const targetPath = path.join(effectiveRoot, 'routes', 'api', `${kebab}.routes.ts`);

  if (fs.existsSync(targetPath)) {
    console.log(`⚠️  Route already exists at: routes/api/${kebab}.routes.ts`);
    return targetPath;
  }

  const content = `import { Router } from 'express';
import { ${camel}Controller } from '../../controllers/${kebab}.controller.js';

const router = Router();

// RESTful Resource Routes (like Route::resource in Laravel)
router.get('/', ${camel}Controller.index.bind(${camel}Controller));
router.get('/:id', ${camel}Controller.show.bind(${camel}Controller));
router.post('/', ${camel}Controller.store.bind(${camel}Controller));
router.put('/:id', ${camel}Controller.update.bind(${camel}Controller));
router.delete('/:id', ${camel}Controller.destroy.bind(${camel}Controller));

export default router;
`;

  fs.writeFileSync(targetPath, content, 'utf-8');
  console.log(`✅ [Route] Created: server/routes/api/${kebab}.routes.ts`);
  return targetPath;
}

// 4. Append to schema.prisma if model doesn't exist
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

// CLI Runner
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
