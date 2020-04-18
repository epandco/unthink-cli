import * as express from 'express';
import * as path from 'path';
import * as https from 'https';
import * as fs from 'fs';
import * as cookieParser from 'cookie-parser';
import * as config from './config/config';
import VersionResource from './resources/version-resource';
import HelloWorldResource from './resources/hello-world-resource';
import { UnthinkExpressGenerator } from '@epandco/unthink-foundation-express';
import { UnthinkGenerator } from '@epandco/unthink-foundation';
import { renderTemplateWithContextAdded } from './nunjucks-renderer';

const app: express.Application = express();
app.use(cookieParser());

const expressGen = new UnthinkExpressGenerator(app, renderTemplateWithContextAdded);
const unthinkGen = new UnthinkGenerator(expressGen);

unthinkGen.add(VersionResource);
unthinkGen.add(HelloWorldResource);
unthinkGen.generate();

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
