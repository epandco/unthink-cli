import { UnthinkGeneratorBackend } from '../unthink-foundation/unthink-generator-backend';
import {
  ResourceDefinition,
  ResourceRouteDefinition,
  ResourceRouteHandler,
  RouteMethod
} from '../unthink-foundation/resource-definition';
import { ServiceResult } from '../unthink-foundation/service-result';
import * as express from 'express-serve-static-core';

export class UnthinkExpressGenerator implements UnthinkGeneratorBackend {
  private app: express.Application;

  constructor(app: express.Application) {
    this.app = app;
  }

  generate(resourceDefinitions: ResourceDefinition[]): void {
    for (const rd of resourceDefinitions) {
      this.generateDefiniton(rd);
    }
  }

  generateDefiniton(resourceDefinition: ResourceDefinition) {
    for (const rt of resourceDefinition.routes) {
      this.generateRoute(rt, resourceDefinition);
    }
  }

  generateRoute(
    resourceRouteDefinition: ResourceRouteDefinition,
    resourceDefinition: ResourceDefinition) {

    const router = express.Router();
    if (resourceRouteDefinition.__routeType === 'DATA') {
      for (const method in resourceRouteDefinition.methods) {
        const handler = resourceRouteDefinition.methods[method as RouteMethod];

        if (!handler) {
          throw new Error('Handler must be defined');
        }

        this.generateDataMethod(
          method as RouteMethod,
          handler,
          router,
          resourceRouteDefinition,
          resourceDefinition

        );
      }
    }

    const basePath = `${resourceRouteDefinition.prefix ?? ''}${resourceDefinition.basePath}`;
    this.app.use(basePath, router);
  }

  generateDataMethod(
    method: RouteMethod,
    routeHandler: ResourceRouteHandler<ServiceResult>,
    router: express.Router,
    resourceRouteDefinition: ResourceRouteDefinition,
    resourceDefinition: ResourceDefinition) {

    // TODO: Hookup express.
    const path = resourceRouteDefinition.path;
  }
}