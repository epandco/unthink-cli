/* eslint-disable @typescript-eslint/no-var-requires */

const {registerPreprocessor} = require('@riotjs/compiler');
const {join} = require('path');
const stripIndent = require('strip-indent');
const sass = require('sass');
const stylelint = require('stylelint');
const { initRiotTypeScriptPreprocessor } = require('@epandco/riot-typescript-preprocessor');

const CLIENT_ROOT_PATH = join(process.cwd(), 'src', 'client');

initRiotTypeScriptPreprocessor(registerPreprocessor, {
  sourcePath: CLIENT_ROOT_PATH,
  riotTypingsPath: join(CLIENT_ROOT_PATH, 'typings.d.ts')
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
