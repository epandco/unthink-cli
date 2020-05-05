import * as express from 'express';
import * as path from 'path';
import * as https from 'https';
import * as fs from 'fs';
import * as cookieParser from 'cookie-parser';
import * as config from './config/config';
import { UnthinkExpressGenerator } from '@epandco/unthink-foundation-express';
import { renderTemplateWithContextAdded } from './nunjucks-renderer';
import { UnthinkGenerator } from '@epandco/unthink-foundation';
import resourceDefinitions from './resource-definitions';

const app: express.Application = express();
app.use(cookieParser());

// For local development, the webpack dev server is used to serve up bundles
if (!config.isProduction) {
  /* eslint-disable */
  const { forwardToWebpackDevServer } =  require('./webpack-proxy');
  /* eslint-enable */
  app.all('/public/js/*', forwardToWebpackDevServer);

  // In production, assets should be served via nginx
  app.use('/public/', express.static(path.join(process.cwd(), 'public')));
}

const expressGen = new UnthinkExpressGenerator(
  app,
  renderTemplateWithContextAdded,
  config.logLevel
);
const unthinkGen = new UnthinkGenerator(expressGen);

resourceDefinitions.forEach(rd => unthinkGen.add(rd));

unthinkGen.printRouteTable();
unthinkGen.generate();

if (!config.isProduction) {
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
