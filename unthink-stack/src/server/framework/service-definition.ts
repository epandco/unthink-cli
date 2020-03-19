import { ServiceResult } from './service-result';

type HandlerMethod = 'GET' | 'PUT' | 'POST' | 'DELETE';

export interface HandlerContext {
  query?: Record<string, string>;
  path?: Record<string, string>;
  body?: object;
}

interface HandlerFunction {
  (context: HandlerContext): Promise<ServiceResult>;
}

export interface ServiceDefinition {
  [key: string]:  Partial<Record<HandlerMethod, HandlerFunction>>;
}