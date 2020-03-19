import { ServiceResult } from './service-result';
import { TemplateResult } from './template-result';

type HandlerMethod = 'GET' | 'PUT' | 'POST' | 'DELETE';

export interface HandlerContext {
  query?: Record<string, string>;
  path?: Record<string, string>;
  body?: object;
}

interface ServiceHandlerFunction {
  (context: HandlerContext): Promise<ServiceResult>;
}

interface TemplateHandlerFunction {
  (context: HandlerContext): Promise<TemplateResult>;
}

export interface ServiceDefinition {
  [key: string]:  Partial<Record<HandlerMethod, ServiceHandlerFunction>>;
}

export interface TemplateDefintion {
  [key: string]:  Partial<Record<HandlerMethod, TemplateHandlerFunction>>;
}