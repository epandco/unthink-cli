import * as config from './config/config';
import { configure } from 'nunjucks';
import { MiddlewareResult, RouteContext, ViewResult } from '@epandco/unthink-foundation';
import { Result } from '@epandco/unthink-foundation/lib/foundation/result';

const nunjucksEnvironment = configure(config.nunjucksBaseTemplatePath, { autoescape: true });

const nunjucksContext = {
  'APP_VERSION': config.appVersion,
  'IS_PRODUCTION': config.isProduction
};

function render(template: string, value: object | undefined): string {
  const fullValue = { ...value, ...nunjucksContext};
  const rendered = nunjucksEnvironment.render(template, fullValue);

  return rendered;
}

export function renderTemplateWithContextAdded(result: Result, _ctx: RouteContext): string {
  if (result instanceof ViewResult) {
    return render(result.template as string, result.value as object);
  }

  if (result instanceof MiddlewareResult) {
    // Only supporting error codes.
    //
    // Successful status codes should not make it to this function
    let template: string;
    switch (result.status) {
      case 400:
      case 500:
        template = 'error.njk';
        break;
      case 401:
        template = 'unauthorized.njk';
        break;
      case 404:
        template = 'not-found.njk';
        break;
      default:
        throw new Error(`A default template for status code ${result.status} is not supported in the render function`);
    }

    return render(template, result.value as object);
  }

  throw new Error('Result is not supported');
}