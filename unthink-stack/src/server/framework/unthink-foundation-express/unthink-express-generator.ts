import * as config from '../../config/config';
import * as nunjucks from 'nunjucks';
import * as path from 'path';

import { UnthinkGeneratorBackend } from '../unthink-foundation/unthink-generator-backend';
import { ServiceResult } from '../unthink-foundation/service-result';
import { TemplateResult } from '../unthink-foundation/template-result';
import { UnthinkExpressMiddlewareError } from './unthink-express-middleware-error';

import {
  ResourceDefinition,
  ResourceRouteDefinition,
  ResourceRouteHandlerBase,
  RouteContext,
  RouteMethod
} from '../unthink-foundation/resource-definition';
import {
  Application,
  Router,
  RequestHandler,
  Request,
  Response,
  NextFunction,
  json
} from 'express';

nunjucks.configure(config.nunjucksBaseTemplatePath, { autoescape: true });

interface GeneratedRoute {
  prefix: string;
  router: Router;
}

interface GeneratedDefinition {
  path: string;
  router: Router;
}

async function dataErrorHandler(err: unknown, _req: Request, resp: Response, _next: NextFunction ): Promise<void> {
  if (resp.headersSent) {
    console.log('Response already sent. This is likely a bug in the route pipeline in this package.');
    return;
  }

  if (!err) {
    console.log('No error passed into handler');
    resp.status(500).send('unknown error');
    return;
  }

  if (err instanceof UnthinkExpressMiddlewareError) {
    resp.status(err.status);
    resp.send(err.value);
    return;
  }

  console.log('Unexpected error:', err);
  resp.status(500).send('unknown error');

  return;
}

function buildDataHandler(resourceRouteHandler: ResourceRouteHandlerBase<ServiceResult>): RequestHandler {
  return async (req, resp, next): Promise<void> => {
    resp.contentType('application/json');

    let error: unknown;
    try {
      const ctx: RouteContext = {
        query: req.query,
        params: req.params,
        body: req.body
      };

      const result = await resourceRouteHandler(ctx);

      if (result.isOk) {
        const status = result.value ? 200 : 204;
        resp.status(status);
        resp.send(result.value);
        return;
      }

      const status = result.notFound ? 404 : 400;
      error = new UnthinkExpressMiddlewareError(
        status,
        result.error
      );

    } catch (e) {
      error = e;
    }

    next(error);
  };
}

function buildViewHandler(resourceRouteHandler: ResourceRouteHandlerBase<TemplateResult>): RequestHandler {
  return async (req, resp, next): Promise<void> => {
    resp.contentType('text/html');

    let error: unknown;
    try {
      const ctx: RouteContext = {
        query: req.query,
        params: req.params,
        body: req.body
      };

      const result = await resourceRouteHandler(ctx);

      if (result.isTemplate) {
        const body = nunjucks.render(result.templatePath as string, result.templateModel as object);
        resp.status(200).send(body);
        return;
      }

      if (result.isRedirect) {
        resp.redirect(302, result.redirectUrl as string);
        return;
      }

      error = new Error('View handler got an invalid TemplateResult with both isRedirect and isTemplate set to false.');
    } catch (e) {
      error = e;
    }

    next(error);
  };
}

function generateRoute(resourceRouteDefinition: ResourceRouteDefinition<RequestHandler>): GeneratedRoute {
  const router = Router();
  const route = router.route(resourceRouteDefinition.path);

  if (resourceRouteDefinition.__routeType === 'DATA') {
    router.use(dataErrorHandler);
  }

  if (resourceRouteDefinition.middleware && resourceRouteDefinition.middleware.length > 0) {
    route.all(...resourceRouteDefinition.middleware);
  }

  for (const method in resourceRouteDefinition.methods) {
    const resourceHandlerObj = resourceRouteDefinition.methods[method as RouteMethod];

    if (!resourceHandlerObj) {
      throw new Error('Handler must be defined');
    }

    let resourceHandler: ResourceRouteHandlerBase;

    const handlers: RequestHandler[] = [];
    if ('handler' in resourceHandlerObj) {
      resourceHandler = resourceHandlerObj.handler;
      handlers.push(...resourceHandlerObj.middleware);
    } else {
      resourceHandler = resourceHandlerObj;
    }

    switch (resourceRouteDefinition.__routeType) {
    case 'DATA':
      handlers.push(
        buildDataHandler(resourceHandler as ResourceRouteHandlerBase<ServiceResult>)
      );
      break;
    case 'VIEW':
      handlers.push(
        buildViewHandler(resourceHandler as ResourceRouteHandlerBase<TemplateResult>)
      );
      break;
    }

    route[method as RouteMethod](...handlers);
  }


  return {
    prefix: resourceRouteDefinition.prefix ?? '',
    router: router
  };
}

function generateDefinition(resourceDefinition: ResourceDefinition<RequestHandler>): GeneratedDefinition[] {
  const mapPrefixedRoutes = new Map<string, GeneratedDefinition>();

  for (const routeDef of resourceDefinition.routes) {
    const { prefix, router } = generateRoute(routeDef);

    if (!mapPrefixedRoutes.has(prefix)) {
      let basePath = resourceDefinition.basePath;

      if (!basePath) {
        console.log(`basePath is not defined for ${resourceDefinition.name} and being defaulted to '/'`);
        basePath = '/';
      }

      const urlPath = path.join(prefix, basePath);
      console.log(urlPath);
      const generatedDefinition: GeneratedDefinition = {
        path: urlPath,
        router: Router()
      };

      if (resourceDefinition.middleware && resourceDefinition.middleware.length > 0) {
        generatedDefinition.router.use(...resourceDefinition.middleware);
      }

      mapPrefixedRoutes.set(prefix, generatedDefinition);
    }

    mapPrefixedRoutes.get(prefix)?.router.use(router);
  }

  return Array.from(mapPrefixedRoutes.values());
}

export class UnthinkExpressGenerator implements UnthinkGeneratorBackend<RequestHandler> {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  generate(resourceDefinitions: ResourceDefinition<RequestHandler>[]): void {
    const generatedDefinitions = resourceDefinitions.flatMap(generateDefinition);

    this.app.use(json());
    for (const { path, router } of generatedDefinitions) {
      this.app.use(path, router);
    }
  }
}