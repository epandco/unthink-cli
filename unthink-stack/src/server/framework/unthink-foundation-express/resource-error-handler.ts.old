import { Response } from 'express-serve-static-core';
import {
  ResourceError,
  ResourceNotFound,
  ResourceRenderer,
  ResourceUnauthorized
} from 'resource-decorator';
import { ResourceRequest } from './resource-handler';


export async function resourceErrorHandler(err: any, req: ResourceRequest, resp: Response, _next: Function): Promise<void> {
  const renderer: ResourceRenderer = req.local._renderer;

  if (!renderer) {
    req.log.fatal('Unable to get resource renderer from req.local._renderer.');
    req.log.fatal(err, 'Error passed in.');
    if (!resp.headersSent) {
      resp.status(500).send('fatal error check logs');
      return;
    }
  }

  resp.contentType(renderer.contentType);

  try {
    if (err instanceof ResourceError) {
      const rendered = await renderer.expectedError(err);
      resp.status(400).send(rendered);
      return;
    }

    if (err instanceof ResourceNotFound) {
      const rendered = await renderer.notFound();
      resp.status(404).send(rendered);
      return;
    }

    if (err instanceof ResourceUnauthorized) {
      const rendered = await renderer.unauthorized();
      resp.status(401).send(rendered);
      return;
    }

    req.log.fatal(err);
    const rendered = await renderer.fatalError('Fatal error please check logs');
    resp.status(500).send(rendered);
    return;
  } catch (error) {
    req.log.fatal('unexpected error');
    req.log.fatal(err);
    if (!resp.headersSent) {
      resp.status(500).send();
    }
  }
}