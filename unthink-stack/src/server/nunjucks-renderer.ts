import * as config from './config/config';
import { configure } from 'nunjucks';

const nunjucksEnvironment = configure(config.nunjucksBaseTemplatePath, { autoescape: true });

const nunjucksContext = {
  'APP_VERSION': config.appVersion,
  'IS_PRODUCTION': config.isProduction
};

export function renderTemplateWithContextAdded(template: string, value: unknown): string {
  const valueCast = value as object | undefined;
  const fullValue = { ...valueCast, ...nunjucksContext};
  const result = nunjucksEnvironment.render(template as string, fullValue);

  return result;
}