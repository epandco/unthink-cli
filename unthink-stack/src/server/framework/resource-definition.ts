import { ServiceResult } from './service-result';
import { TemplateResult } from './template-result';

type HandlerMethod = 'GET' | 'PUT' | 'POST' | 'DELETE';

export interface HandlerContext {
  query?: Record<string, string>;
  path?: Record<string, string>;
  body?: object;
}

interface HandlerFunction<ResourceResult> {
  (context: HandlerContext): Promise<ResourceResult>;
}

interface BaseDefinition<Result> {
  routes: { [key: string]:  Partial<Record<HandlerMethod, HandlerFunction<Result>>> };
}

type ApiResourceDefinition = BaseDefinition<ServiceResult>;
type TemplateResourceDefinition = BaseDefinition<TemplateResult>;

type TaggedApiResourceDefinition = { kind: 'API' } & ApiResourceDefinition;
type TaggedTemplateResourceDefinition = { kind: 'TEMPLATE' } & TemplateResourceDefinition;


export type ResourceDefinition = TaggedApiResourceDefinition | TaggedTemplateResourceDefinition;

export function defineApiResource(definition: ApiResourceDefinition): ResourceDefinition {
  return { ...{kind: 'API'} , ...definition };
}

export function defineTemplateResource(definition: TemplateResourceDefinition): ResourceDefinition {
  return { ...{kind: 'TEMPLATE'} , ...definition };
}
