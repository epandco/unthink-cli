import { ResourceDefinition } from './resource-definition';

export interface UnthinkGeneratorBackend {
  generate(resourceDefinitions: ResourceDefinition[]): void;
}