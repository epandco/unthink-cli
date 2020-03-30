import { ResourceDefinition, ResourceRouteHandlerBase, RouteMethod } from './resource-definition';
import { UnthinkGeneratorBackend } from './unthink-generator-backend';

export interface RouteGeneratorContext {
  method: RouteMethod;
  fullPath: string;
  resourceLevelMiddleware?: unknown[];
  routeLevelMiddleware?: unknown[];
  methodLevelMiddleware?: unknown[];
  handler: ResourceRouteHandlerBase;
}

export class UnthinkGenerator {
  private resourceDefinitions: ResourceDefinition[] = [];
  private generatorBackend: UnthinkGeneratorBackend;

  constructor(generatorBackend: UnthinkGeneratorBackend) {
    this.generatorBackend = generatorBackend;
  }

  add(resourceDefinition: ResourceDefinition): UnthinkGenerator {
    this.resourceDefinitions.push(resourceDefinition);

    return this;
  }

  generate(): void {
    const routeContexts = this.resourceDefinitions.flatMap(rd => {
      return rd.routes.flatMap(rt => {
        const routeContexts = [];
        for (const method in rt.methods) {
          const methodHandler = rt.methods[method as RouteMethod];

          if (!methodHandler) {
            throw new Error('Handler must be defined');
          }

          let handler: ResourceRouteHandlerBase;
          let methodLevelMiddleware: unknown[] | undefined;

          if ('handler' in methodHandler) {
            handler = methodHandler.handler;
            methodLevelMiddleware = methodHandler.middleware;
          } else {
            handler = methodHandler;
          }

          const routeContext: RouteGeneratorContext = {
            method: method as RouteMethod,
            fullPath: `${rt.prefix ?? ''}${rd.basePath}${rt.path}`,
            resourceLevelMiddleware: rd.middleware,
            routeLevelMiddleware: rt.middleware,
            methodLevelMiddleware: methodLevelMiddleware,
            handler: handler
          };

          routeContexts.push(routeContext);
        }

        return routeContexts;
      });
    });

    this.generatorBackend.generate(routeContexts);
  }
}