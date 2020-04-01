import { ResourceDefinition } from './resource-definition';
import { UnthinkGeneratorBackend } from './unthink-generator-backend';

export class UnthinkGenerator {
  private resourceDefinitions: ResourceDefinition[] = [];
  private generatorBackend: UnthinkGeneratorBackend;

  constructor(generatorBackend: UnthinkGeneratorBackend) {
    this.generatorBackend = generatorBackend;
  }

  add(resourceDefinition: ResourceDefinition): UnthinkGenerator {
    this.resourceDefinitions.push(resourceDefinition);
    return this;
  }

  generate(): void {
    this.generatorBackend.generate(this.resourceDefinitions);
  }
}