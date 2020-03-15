/* eslint-disable */
const httpProxy = require('http-proxy');
import { webpackDevServerPort } from './config/config';

const webpackProxy = httpProxy.createProxyServer({
  secure: false
});

export function forwardToWebpackDevServer(req: any, res: any) {
  webpackProxy.web(req, res, {
    target: `https://localhost:${webpackDevServerPort}`
  });
}
