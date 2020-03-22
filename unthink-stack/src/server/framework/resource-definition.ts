import { ServiceResult } from './service-result';
import { TemplateResult } from './template-result';

type RouteMethod = 'GET' | 'PUT' | 'POST' | 'DELETE';

interface RouteContext {
  query?: Record<string, string>;
  path?: Record<string, string>;
  body?: object;
}

interface ResourceRouteHandlerBase<Result> {
  (context: RouteContext): Promise<Result>;
}

interface ResourceRouteHandlerWithMiddleware<Result> {
  handler: ResourceRouteHandlerBase<Result>;
  middleware: unknown[];
}

type ResourceRouteHandler<Result> = ResourceRouteHandlerBase<Result> | ResourceRouteHandlerWithMiddleware<Result>

interface ResourceRouteDefinitionBase<Result> {
  path: string;
  prefix?: string;
  middleware?: unknown[];
  handlers: Partial<Record<RouteMethod, ResourceRouteHandler<Result>>>;
}

interface ResourceDataRouteDefinition extends ResourceRouteDefinitionBase<ServiceResult> {
  __routeType: 'DATA';
}

interface ResourceViewRouteDefinition extends ResourceRouteDefinitionBase<TemplateResult> {
  __routeType: 'VIEW';
}

type ResourceRouteDefinition = ResourceDataRouteDefinition | ResourceViewRouteDefinition;

interface ResourceDefinition {
  basePath: string;
  middleware?: unknown[];
  routes: ResourceRouteDefinition[];
}

interface ResourceConfig {
  prefix?: string;
  middleware?: unknown[];
}

/** builder functions **/

function data(
  path: string,
  handlers: Partial<Record<RouteMethod, ResourceRouteHandler<ServiceResult>>>,
  config: ResourceConfig = {}): ResourceRouteDefinition {

  if (!config.prefix) {
    config.prefix = '/api';
  }


  return {
    __routeType: 'DATA',
    path: path,
    handlers: handlers,
    prefix: config.prefix,
    middleware: config.middleware
  };
}
function view(
  path: string,
  handlers: Partial<Record<RouteMethod, ResourceRouteHandler<TemplateResult>>>,
  config: ResourceConfig = {}): ResourceViewRouteDefinition {

  return {
    __routeType: 'VIEW',
    path: path,
    handlers: handlers,
    prefix: config.prefix,
    middleware: config.middleware
  };
}

export { RouteMethod, RouteContext, ResourceDefinition, data, view };
