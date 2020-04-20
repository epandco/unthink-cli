import { UnthinkExpressGenerator } from '@epandco/unthink-foundation-express';
import { renderTemplateWithContextAdded } from './nunjucks-renderer';
import { UnthinkGenerator } from '@epandco/unthink-foundation';
import VersionResource from './resources/version-resource';
import HelloWorldResource from './resources/hello-world-resource';
import { Application } from 'express';

/** Add new resources to the list below */
const resourceDefinitions = [
  VersionResource,
  HelloWorldResource
];


export function init(app: Application): void {
  const expressGen = new UnthinkExpressGenerator(app, renderTemplateWithContextAdded);
  const unthinkGen = new UnthinkGenerator(expressGen);

  resourceDefinitions.forEach(rd => unthinkGen.add(rd));

  unthinkGen.printRouteTable();
  unthinkGen.generate();
}