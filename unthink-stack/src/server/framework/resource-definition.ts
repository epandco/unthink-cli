import { ServiceResult } from './service-result';
import { TemplateResult } from './template-result';

type RouteMethod = 'GET' | 'PUT' | 'POST' | 'DELETE';

interface RouteContext {
  query?: Record<string, string>;
  path?: Record<string, string>;
  body?: object;
}

/**
 * Represents the generic handler used by all route handlers.
 *
 * This may change a bit. The result might end being a wrapper like
 *
 * RouteResult<Result> where result would be ServiceResult | TemplateResult.
 *
 * Rationale there is that we may want to in the handlers set cookies / headers but not want this in the
 * service result for example. We probably do not want the service layer returning cookies/headers in the ServiceResult.
 *
 * Don't know yet.
 */
interface ResourceRouteHandlerBase<Result> {
  (context: RouteContext): Promise<Result>;
}

interface ResourceRouteHandlerWithMiddleware<Result> extends ResourceRouteHandlerBase<Result>{
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

/** builder functions **/

function data(
  path: string,
  handlers: Partial<Record<RouteMethod, ResourceRouteHandler<ServiceResult>>>,
  prefix: string = '/api',
  middleware?: unknown[]): ResourceRouteDefinition {

  return {
    __routeType: 'DATA',
    path: path,
    handlers: handlers,
    prefix: prefix,
    middleware: middleware
  };

}
function view(
  path: string,
  handlers: Partial<Record<RouteMethod, ResourceRouteHandler<TemplateResult>>>,
  prefix?: string,
  middleware?: unknown[]): ResourceViewRouteDefinition {

  return {
    __routeType: 'VIEW',
    path: path,
    handlers: handlers,
    prefix: prefix,
    middleware: middleware
  };
}

export { RouteMethod, RouteContext, ResourceDefinition, data, view };
