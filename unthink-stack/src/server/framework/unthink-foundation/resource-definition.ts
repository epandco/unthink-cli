import { ServiceResult } from './service-result';
import { TemplateResult } from './template-result';

export type RouteMethod = 'get' | 'put' | 'post' | 'delete';

export interface RouteContext {
  query?: Record<string, string>;
  params?: Record<string, string>;
  body?: object;
}

export interface ResourceRouteHandlerBase<Result = unknown> {
  (context: RouteContext): Promise<Result>;
}

export interface ResourceRouteHandlerWithMiddleware<Result> {
  handler: ResourceRouteHandlerBase<Result>;
  middleware: unknown[];
}

export type ResourceRouteHandler<Result> = ResourceRouteHandlerBase<Result> | ResourceRouteHandlerWithMiddleware<Result>

type ResourceMethodMap<Result> = Partial<Record<RouteMethod, ResourceRouteHandler<Result>>>;

export interface ResourceRouteDefinitionBase<Result> {
  path: string;
  prefix?: string;
  middleware?: unknown[];
  methods: ResourceMethodMap<Result>;
}

export interface ResourceDataRouteDefinition extends ResourceRouteDefinitionBase<ServiceResult> {
  __routeType: 'DATA';
}

export interface ResourceViewRouteDefinition extends ResourceRouteDefinitionBase<TemplateResult> {
  __routeType: 'VIEW';
}

export type ResourceRouteDefinition = ResourceDataRouteDefinition | ResourceViewRouteDefinition;

export interface ResourceDefinition {
  name: string;
  basePath?: string;
  middleware?: unknown[];
  routes: ResourceRouteDefinition[];
}

interface ResourceConfig {
  prefix?: string;
  middleware?: unknown[];
}

/** builder functions **/

export function data(
  path: string,
  methods: ResourceMethodMap<ServiceResult>,
  config: ResourceConfig = {}): ResourceRouteDefinition {

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

export function view(
  path: string,
  handler: string | ResourceRouteHandler<TemplateResult>,
  config: ResourceConfig = {}): ResourceViewRouteDefinition {

  let methodMap: ResourceMethodMap<TemplateResult>;

  if (typeof handler === 'string') {
    methodMap = {
      'get': async (): Promise<TemplateResult> => TemplateResult.view(handler)
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

