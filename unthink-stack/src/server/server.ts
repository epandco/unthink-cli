import * as express from 'express';
import * as path from 'path';
import * as https from 'https';
import * as fs from 'fs';
import * as cookieParser from 'cookie-parser';
import * as config from './config/config';
import {defaultContainer} from './config/di-container';
import { registerResource } from 'express-register-resource';
import { ResourceType, registerDefaultRenderer } from 'resource-decorator';
import { HelloWorldResource } from './resources/hello-world-resource';
import { NunjucksResourceRenderer } from 'nunjucks-resource-renderer';

const app: express.Application = express();
app.use(cookieParser());

// open the package.json to get the version information
const {version} = JSON.parse(fs.readFileSync('./package.json').toString());

// Set up template rendering
const nunjucksResourceRenderer = new NunjucksResourceRenderer(
  config.nunjucksBaseTemplatePath,
  {
    'APP_VERSION': version,
    'IS_PRODUCTION': config.isProduction
  },
  config.nunjucksNotFoundTemplate,
  config.nunjucksExpectedErrorTemplate,
  config.nunjucksFatalErrorTemplate,
  config.nunjucksUnauthorizedTemplate
);
registerDefaultRenderer(ResourceType.TEMPLATE, nunjucksResourceRenderer);

// Register resources here
registerResource(app, HelloWorldResource, defaultContainer);

// For local development, the webpack dev server is used to serve up bundles
if (!config.isProduction) {
  /* eslint-disable */
  const { forwardToWebpackDevServer } =  require('./webpack-proxy');
  /* eslint-enable */
  app.all('/public/js/*', forwardToWebpackDevServer);

  // In production, assets should be served via nginx
  app.use('/public/', express.static(path.join(process.cwd(), 'public')));

  // Enable HTTPS for local development
  https.createServer(
    {
      key: fs.readFileSync('./certs/localhost.key'),
      cert: fs.readFileSync('./certs/localhost.crt'),
    },
    app
  ).listen(config.expressServerPort);
} else {
  app.listen(config.expressServerPort);
}
