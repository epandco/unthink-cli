const merge = require('webpack-merge');
const webpack = require('webpack');
const common = require('./webpack.common');
const path = require('path');

require('dotenv').config({
  path: path.join(process.cwd(), '.env')
});

// `merge` takes the base config and merges it with these new settings
module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-maps',
  devServer: {
    open: false,
    hot: true,
    port: process.env.WEBPACK_DEV_PORT ? parseInt(process.env.WEBPACK_DEV_PORT) : 3030,
    https: {
      key: path.join(process.cwd(), 'certs', 'localhost.key'),
      cert: path.join(process.cwd(), 'certs', 'localhost.crt')
    },
    publicPath: '/public/js/',
    stats: 'errors-only'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
});
