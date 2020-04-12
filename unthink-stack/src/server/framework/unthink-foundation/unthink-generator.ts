import { ResourceDefinition } from './resource-definition';
import { UnthinkGeneratorBackend } from './unthink-generator-backend';

export class UnthinkGenerator<ResourceMiddleware> {
  private resourceDefinitions: ResourceDefinition<ResourceMiddleware>[] = [];
  private generatorBackend: UnthinkGeneratorBackend<ResourceMiddleware>;

  constructor(generatorBackend: UnthinkGeneratorBackend<ResourceMiddleware>) {
    this.generatorBackend = generatorBackend;
  }

  add(resourceDefinition: ResourceDefinition<ResourceMiddleware>): UnthinkGenerator<ResourceMiddleware> {
    this.resourceDefinitions.push(resourceDefinition);
    return this;
  }

  generate(): void {
    this.generatorBackend.generate(this.resourceDefinitions);
  }
}