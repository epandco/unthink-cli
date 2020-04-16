import * as express from 'express';
import * as path from 'path';
import * as https from 'https';
import * as fs from 'fs';
import * as cookieParser from 'cookie-parser';
import * as config from './config/config';
import { UnthinkGenerator } from './framework/unthink-foundation/unthink-generator';
import {
  NunjucksConfig,
  UnthinkExpressGenerator
} from './framework/unthink-foundation-express/unthink-express-generator';
import HelloWorldDefinition from './resource-definitions/hello-world-resource-definition';


const app: express.Application = express();
app.use(cookieParser());

// open the package.json to get the version information
const {version} = JSON.parse(fs.readFileSync('./package.json').toString());

// Set up template rendering
const nunjucksConfig: NunjucksConfig = {
  baseTemplatePath: config.nunjucksBaseTemplatePath,
  context: {
    'APP_VERSION': version,
    'IS_PRODUCTION': config.isProduction
  },
  notFoundTemplate: config.nunjucksNotFoundTemplate,
  expectedErrorTemplate: config.nunjucksExpectedErrorTemplate,
  fatalErrorTemplate: config.nunjucksFatalErrorTemplate,
  unauthorizedTemplate: config.nunjucksUnauthorizedTemplate
};

const unthinkExpressGenerator = new UnthinkExpressGenerator(app, nunjucksConfig);
const generator = new UnthinkGenerator(unthinkExpressGenerator);

generator.add(HelloWorldDefinition);

// creates the express routes
generator.generate();

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
