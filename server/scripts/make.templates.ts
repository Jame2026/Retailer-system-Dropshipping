export function formatNames(rawName: string) {
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

export function getServiceContent(names: ReturnType<typeof formatNames>): string {
  const { pascal, camel, plural } = names;
  return `import { prisma } from '../database/client.js';

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
}

export function getControllerContent(names: ReturnType<typeof formatNames>): string {
  const { pascal, camel, kebab } = names;
  return `import { Request, Response, NextFunction } from 'express';
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
}

export function getRouteContent(names: ReturnType<typeof formatNames>): string {
  const { camel, kebab } = names;
  return `import { Router } from 'express';
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
}
