import { configure, Environment } from 'nunjucks';
import * as path from 'path';

import { UnthinkGeneratorBackend } from '../unthink-foundation/unthink-generator-backend';

import { UnthinkViewResult } from '../unthink-foundation/unthink-view-result';
import { UnthinkDataResult } from '../unthink-foundation/unthink-data-result';

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
  json,
  ErrorRequestHandler
} from 'express';

export interface NunjucksConfig {
  baseTemplatePath: string;
  context?: object;
  notFoundTemplate?: string;
  expectedErrorTemplate?: string;
  fatalErrorTemplate?: string;
  unauthorizedTemplate?: string;
}

interface GeneratedRoute {
  prefix: string;
  router: Router;
}

interface GeneratedDefinition {
  path: string;
  router: Router;
}

function renderTemplateWithContextAdded(template: string, nunjucksEnvironment: Environment, nunjucksConfig: NunjucksConfig, value?: unknown): string {
  const valueCast = value as object | undefined;
  const fullValue = { ...valueCast, ...nunjucksConfig.context};
  const result = nunjucksEnvironment.render(template as string, fullValue);

  return result;
}

function buildViewHandler(resourceRouteHandler: ResourceRouteHandlerBase<UnthinkViewResult>, nunjucksEnvironment: Environment, nunjucksConfig: NunjucksConfig): RequestHandler {
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

      if (result.status === 200) {
        const body = renderTemplateWithContextAdded(
          result.template as string,
          nunjucksEnvironment,
          nunjucksConfig,
          result.value
        );
        resp.status(200);
        resp.send(body);

        return;
      }

      // Pass along and let the view error handler deal with the result
      error = result;
    } catch (e) {
      error = e;
    }

    next(error);
  };
}

function buildViewErrorHandler(nunjucksEnv: Environment, nunjucksConfig: NunjucksConfig): ErrorRequestHandler {
  return async (err: unknown, _req: Request, resp: Response, _next: NextFunction ): Promise<void> => {
    if (resp.headersSent) {
      console.log('Response already sent. This is likely a bug in the route pipeline in this package.');
      return;
    }

    if (!err) {
      console.log('No error passed into handler');
      resp.status(500).send('unknown error');
      return;
    }

    if (err instanceof UnthinkViewResult) {
      if (err.status === 301 || err.status === 302) {
        resp.redirect(err.status as number, err.redirectUrl as string);
        return;
      }

      let template: string | undefined;

      if (err.template) {
        template = err.template;
      } else {
        switch (err.status) {
        case 400:
          template = nunjucksConfig.expectedErrorTemplate;
          break;
        case 401:
          template = nunjucksConfig.unauthorizedTemplate;
          break;
        case 404:
          template = nunjucksConfig.notFoundTemplate;
          break;
        default:
          console.log(`status: ${err.status} not supported`);
        }
      }

      if (!template) {
        resp.status(500);
        resp.send('unknown error');
        return;
      }

      const view = renderTemplateWithContextAdded(
        template,
        nunjucksEnv,
        nunjucksConfig,
        err.value
      );

      resp.status(err.status);
      resp.send(view);
      return;
    }

    console.log('Unexpected error:', err);
    resp.status(500).send('unknown error');

    return;
  };
}

function buildDataHandler(resourceRouteHandler: ResourceRouteHandlerBase<UnthinkDataResult>): RequestHandler {
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

      if (result.status === 200 || result.status == 204) {
        resp.status(result.status);
        resp.send(result.value);
        return;
      }

      // Pass along and let error handler render it
      error = result;
    } catch (e) {
      error = e;
    }

    next(error);
  };
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

  if (err instanceof UnthinkDataResult) {
    // TODO: Handle headers and cookies

    resp.status(err.status);
    resp.send(err.value);
    return;
  }

  console.log('Unexpected error:', err);
  resp.status(500).send('unknown error');

  return;
}

export class UnthinkExpressGenerator implements UnthinkGeneratorBackend<RequestHandler> {
  private readonly app: Application;
  private readonly nunjucksEnvironment: Environment;
  private readonly nunjucksConfig: NunjucksConfig;

  constructor(app: Application, nunjucksConfig: NunjucksConfig) {
    this.app = app;
    this.nunjucksConfig = nunjucksConfig;
    this.nunjucksEnvironment = configure(nunjucksConfig.baseTemplatePath, { autoescape: true});
  }

  generate(resourceDefinitions: ResourceDefinition<RequestHandler>[]): void {
    const generatedDefinitions = resourceDefinitions.flatMap(p => this.generateDefinition(p));

    this.app.use(json());
    for (const { path, router } of generatedDefinitions) {
      this.app.use(path, router);
    }
  }

  generateRoute(resourceRouteDefinition: ResourceRouteDefinition<RequestHandler>): GeneratedRoute {
    const router = Router();
    const route = router.route(resourceRouteDefinition.path);

    switch (resourceRouteDefinition.__routeType) {
    case 'DATA':
      router.use(dataErrorHandler);
      break;
    case 'VIEW':
      router.use(buildViewErrorHandler(this.nunjucksEnvironment, this.nunjucksConfig));
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
          buildDataHandler(resourceHandler as ResourceRouteHandlerBase<UnthinkDataResult>)
        );
        break;
      case 'VIEW':
        handlers.push(
          buildViewHandler(
            resourceHandler as ResourceRouteHandlerBase<UnthinkViewResult>,
            this.nunjucksEnvironment,
            this.nunjucksConfig
          )
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

  generateDefinition(resourceDefinition: ResourceDefinition<RequestHandler>): GeneratedDefinition[] {
    const mapPrefixedRoutes = new Map<string, GeneratedDefinition>();

    for (const routeDef of resourceDefinition.routes) {
      const { prefix, router } = this.generateRoute(routeDef);

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
}