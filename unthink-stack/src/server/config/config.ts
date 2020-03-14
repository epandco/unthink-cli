import * as dotenv from 'dotenv';

dotenv.config();

function getEnvironmentValue(name: string): string {
  if (process.env[name]) {
    return process.env[name] as string;
  }

  throw new Error(`Environment variable: ${name} is not set. If using .env please check your .env file`);
}

export const mongoDbUrl: string = getEnvironmentValue('MONGO_DB_URL');
export const mongoDbDefaultDatabase = getEnvironmentValue('MONGO_DB_DEFAULT_DB');
export const expressServerPort: number = parseInt(getEnvironmentValue('EXPRESS_SERVER_PORT'));
export const webpackDevServerPort: number | null = process.env.hasOwnProperty('WEBPACK_DEV_PORT') ? parseInt(process.env.WEBPACK_DEV_PORT as string) : null;
export const isProduction: boolean = !!(process.env.hasOwnProperty('NODE_ENV') && process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() === 'production');

export const nunjucksBaseTemplatePath = getEnvironmentValue('NUNJUCKS_TEMPLATE_BASE_PATH');
export const nunjucksNotFoundTemplate = getEnvironmentValue('NUNJUCKS_TEMPLATE_NOT_FOUND');
export const nunjucksExpectedErrorTemplate = getEnvironmentValue('NUNJUCKS_TEMPLATE_ERROR');
export const nunjucksFatalErrorTemplate = getEnvironmentValue('NUNJUCKS_TEMPLATE_FATAL_ERROR');
export const nunjucksUnauthorizedTemplate = getEnvironmentValue('NUNJUCKS_TEMPLATE_UNAUTHORIZED');

export const contentBasePath: string = getEnvironmentValue('CONTENT_BASE_PATH');
