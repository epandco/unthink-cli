import { ResourceDefinition } from '../unthink-foundation/resource-definition';
import { RequestHandler } from 'express';


// Primary purpose is to specialize ResourceDefinition for express middleware so that when declaring a route definition
// you get strongly typed middelware functions.
export function expressResource(resourceDefinition: ResourceDefinition<RequestHandler>): ResourceDefinition<RequestHandler> {
  return resourceDefinition;
}