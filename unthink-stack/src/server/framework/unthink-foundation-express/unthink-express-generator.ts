import { UnthinkGeneratorBackend } from '../unthink-foundation/unthink-generator-backend';
import {
  ResourceDefinition,
  ResourceRouteDefinition,
  ResourceRouteHandlerBase,
  RouteContext,
  RouteMethod
} from '../unthink-foundation/resource-definition';
import { ServiceResult } from '../unthink-foundation/service-result';
import { Application, Router, RequestHandler } from 'express';

interface GeneratedRoute {
  prefix: string;
  router: Router;
}

interface GeneratedDefinition {
  path: string;
  router: Router;
}

function buildDataHandler(resourceRouteHandler: ResourceRouteHandlerBase<ServiceResult>): RequestHandler {
  return async (req, resp, next): Promise<void> => {
    resp.contentType('application/json');

    try {
      // TODO: Revisit to see if this is necessary
      if (
        // If we have a body
        req.body &&
        // and the content-type is not set or not application/json
        (
          !req.headers['content-type'] ||
          (req.headers['content-type'] && req.headers['content-type'].toLowerCase() !== 'application/json')
        )
      ) {
        resp.status(415).send();
        return;
      }

      const ctx: RouteContext = {
        query: req.query,
        params: req.params,
        body: req.body
      };

      const result = await resourceRouteHandler(ctx);

      let body: unknown | undefined;
      let status: number;

      if (result.isOk && result.value) {
        status = 200;
        body = result.value;
      } else if (result.isOk && !result.value) {
        status = 204;
      } else if (result.hasError) {
        status = 400;
        body = result.error;
      } else if (result.notFound) {
        status = 404;
        body = result.error;
      } else {
        throw new Error('Invalid case.');
      }

      resp.status(status);

      if (body) {
        resp.send(body);
      } else {
        resp.send();
      }
    } catch (error) {
      next(error);
    }
  };
}

function generateRoute(resourceRouteDefinition: ResourceRouteDefinition): GeneratedRoute {
  const router = Router();
  const route = router.route(resourceRouteDefinition.path);

  if (resourceRouteDefinition.__routeType === 'DATA') {
    for (const method in resourceRouteDefinition.methods) {
      const resourceHandlerObj = resourceRouteDefinition.methods[method as RouteMethod];

      if (!resourceHandlerObj) {
        throw new Error('Handler must be defined');
      }

      let resourceHandler: ResourceRouteHandlerBase<ServiceResult>;

      if ('handler' in resourceHandlerObj) {
        resourceHandler = resourceHandlerObj.handler;
      } else {
        resourceHandler = resourceHandlerObj;
      }

      const expressHandler = buildDataHandler(resourceHandler);

      route[method as RouteMethod](expressHandler);
    }
  } else {
    throw new Error(`${resourceRouteDefinition.__routeType} is not supported yet`);
  }

  return {
    prefix: resourceRouteDefinition.prefix ?? '',
    router: router
  };
}

function generateDefinition(resourceDefinition: ResourceDefinition): GeneratedDefinition[] {
  const mapPrefixedRoutes = new Map<string, GeneratedDefinition>();

  for (const routeDef of resourceDefinition.routes) {
    const { prefix, router } = generateRoute(routeDef);

    if (!mapPrefixedRoutes.has(prefix)) {
      const generatedDefinition: GeneratedDefinition = {
        path: `${prefix ?? ''}${resourceDefinition.basePath}`,
        router: Router()
      };

      mapPrefixedRoutes.set(prefix, generatedDefinition);
    }

    mapPrefixedRoutes.get(prefix)?.router.use(router);
  }

  return Array.from(mapPrefixedRoutes.values());
}

export class UnthinkExpressGenerator implements UnthinkGeneratorBackend {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  generate(resourceDefinitions: ResourceDefinition[]): void {
    const generatedDefinitions = resourceDefinitions.flatMap(generateDefinition);

    for (const { path, router } of generatedDefinitions) {
      this.app.use(path, router);
    }
  }
}