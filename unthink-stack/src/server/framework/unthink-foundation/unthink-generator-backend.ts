import { ResourceDefinition } from './resource-definition';

export interface UnthinkGeneratorBackend<ResourceMiddleware> {
  generate(resourceDefinitions: ResourceDefinition<ResourceMiddleware>[]): void;
}