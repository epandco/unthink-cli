/* eslint-disable @typescript-eslint/no-var-requires */

const {registerPreprocessor} = require('@riotjs/compiler');
const transform = require('./riot-typescript-transformer');
const {basename, dirname, join} = require('path');
const {CLIEngine} = require('eslint');
const stripIndent = require('strip-indent');
const {readFileSync} = require('fs');
const sass = require('sass');
const stylelint = require('stylelint');

const eslintRules = JSON.parse(readFileSync(join(process.cwd(), '.eslintrc')));
const cli = new CLIEngine(eslintRules);
const formatter = cli.getFormatter();

const CLIENT_ROOT_PATH = join(process.cwd(), 'src', 'client');

// Riot preprocessor for handling TypeScript inside Riot tags.
// https://riot.js.org/compiler/#pre-processors
registerPreprocessor('javascript', 'ts', (source, {options}) => {
  const filename = `${basename(options.file)}.ts`;
  const fileRoot = dirname(options.file);
  const lintReport = cli.executeOnText(stripIndent(source), options.file);

  if (lintReport.errorCount > 0 || lintReport.warningCount > 0) {
    console.log(formatter(lintReport.results)); // eslint-disable-line
    throw new Error(`Linting reports ${lintReport.errorCount} errors and ${lintReport.warningCount} warnings in Riot components.`);
  }

  // basic type checking and transformation
  const {diagnostics, code, map} = transform(filename, source, fileRoot);
  if (diagnostics && diagnostics.length > 0) {
    throw new Error(`TypeScript compiler reports ${diagnostics.length} errors in Riot Components.`);
  }
  return {code, map};
});

// Riot preprocessor for handling Sass inside Riot tags.
registerPreprocessor('css', 'scss', (source, {options}) => {
  const {file} = options;

  // lint
  stylelint.lint({
    configFile: join(CLIENT_ROOT_PATH, '.stylelintrc'),
    code: stripIndent(source),
    codeFilename: file,
    formatter: 'string'
  })
    .then((data) => {
      if (data.errored) {
        console.log(data.output);
      }
    });

  const {css} = sass.renderSync({
    data: source,
    includePaths: [
      join(CLIENT_ROOT_PATH, 'sass')
    ],
    outputStyle: 'compressed'
  });

  return {
    code: css.toString(),
    map: null
  };
});
