import { UnthinkDataResult } from './unthink-data-result';
import { UnthinkViewResult } from './unthink-view-result';


export type RouteMethod = 'get' | 'put' | 'post' | 'delete';

export interface RouteContext {
  query?: Record<string, string>;
  params?: Record<string, string>;
  body?: object;
}

export interface ResourceRouteHandlerBase<Result = unknown> {
  (context: RouteContext): Promise<Result>;
}

export interface ResourceRouteHandlerWithMiddleware<Result, ResourceMiddleware> {
  handler: ResourceRouteHandlerBase<Result>;
  middleware: ResourceMiddleware[];
}

export type ResourceRouteHandler<Result, ResourceMiddleware> = ResourceRouteHandlerBase<Result> | ResourceRouteHandlerWithMiddleware<Result, ResourceMiddleware>

type ResourceMethodMap<Result, ResourceMiddleware> = Partial<Record<RouteMethod, ResourceRouteHandler<Result, ResourceMiddleware>>>;

export interface ResourceRouteDefinitionBase<Result, ResourceMiddleware> {
  path: string;
  prefix?: string;
  middleware?: ResourceMiddleware[];
  methods: ResourceMethodMap<Result, ResourceMiddleware>;
}

export interface ResourceDataRouteDefinition<ResourceMiddleware> extends ResourceRouteDefinitionBase<UnthinkDataResult, ResourceMiddleware> {
  __routeType: 'DATA';
}

export interface ResourceViewRouteDefinition<ResourceMiddleware> extends ResourceRouteDefinitionBase<UnthinkViewResult, ResourceMiddleware> {
  __routeType: 'VIEW';
}

export type ResourceRouteDefinition<ResourceMiddleware> = ResourceDataRouteDefinition<ResourceMiddleware> | ResourceViewRouteDefinition<ResourceMiddleware>;

export interface ResourceDefinition<ResourceMiddleware> {
  name: string;
  basePath?: string;
  middleware?: ResourceMiddleware[];
  routes: ResourceRouteDefinition<ResourceMiddleware>[];
}

interface ResourceConfig<ResourceMiddleware> {
  prefix?: string;
  middleware?: ResourceMiddleware[];
}

/** builder functions **/

export function data<ResourceMiddleware>(
  path: string,
  methods: ResourceMethodMap<UnthinkDataResult, ResourceMiddleware>,
  config: ResourceConfig<ResourceMiddleware> = {}): ResourceRouteDefinition<ResourceMiddleware> {

  if (!config.prefix) {
    config.prefix = '/api';
  }

  return {
    __routeType: 'DATA',
    path: path,
    methods: methods,
    prefix: config.prefix,
    middleware: config.middleware
  };
}

export function view<ResourceMiddleware>(
  path: string,
  handler: string | ResourceRouteHandler<UnthinkViewResult, ResourceMiddleware>,
  config: ResourceConfig<ResourceMiddleware> = {}): ResourceViewRouteDefinition<ResourceMiddleware> {

  let methodMap: ResourceMethodMap<UnthinkViewResult, ResourceMiddleware>;

  if (typeof handler === 'string') {
    methodMap = {
      'get': async (): Promise<UnthinkViewResult> => UnthinkViewResult.ok(handler)
    };
  } else {
    methodMap = {
      'get': handler
    };
  }

  return {
    __routeType: 'VIEW',
    path: path,
    methods: methodMap,
    prefix: config.prefix,
    middleware: config.middleware
  };
}

