const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
require('./riot-preprocessors');
const {readdirSync, existsSync} = require('fs');

const _rootPath = process.cwd();
const _buildPath = path.join(_rootPath, 'public');

// Create entries from the client/entries folder:
function getDirectoryNames(source) {
  return readdirSync(source, {withFileTypes: true})
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
}

const entries = {};
getDirectoryNames(path.join(_rootPath, 'src', 'client', 'entries'))
    .forEach((dir, index) => {
      const entryName = dir;
      const entryFile = `${entryName}.ts`;
      const entryPath = path.join(_rootPath, 'src', 'client', 'entries', dir, entryFile);
      if (!existsSync(entryPath)) {
        return;
      }
      entries[entryName] = entryPath;
    });

const babelOptions = {
  presets: [
    [
      '@babel/preset-env',
      {
        'targets': 'ie >= 11'
      }
    ]
  ],
};

module.exports = {
  context: path.join(_rootPath, 'src', 'client'),
  entry: {
    polyfillsES5: './polyfills/polyfills.es5.js',
    polyfillsES2015: './polyfills/polyfills.es2015.js',
    ...entries
  },
  module: {
    rules: [
      {
        test: /\.riot$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: babelOptions
          },
          {
            loader: '@riotjs/webpack-loader',
            options: {
              hot: true
            }
          }]
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: babelOptions
        },
        exclude: [
          // Have to ignore core-js for the polyfills
          /core-js/
        ],
      },
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'babel-loader',
            options: babelOptions
          },
          {
            loader: 'ts-loader'
          }
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.riot', '.js'],
  },
  plugins: [
    new CleanWebpackPlugin(),
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.join(_buildPath, 'js'),
    publicPath: '/public/js/'
  },
};
