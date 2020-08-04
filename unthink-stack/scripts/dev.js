/* This script is run via `npm run client`. It utilizes Concurrently to run
 * the different front-end tasks (Sass, Webpack, etc.)
 */

const concurrently = require('concurrently');

concurrently([
  {
    command: 'npm:watch-content',
    name: 'content',
    prefixColor: 'yellow.bold'
  },
  {
    command: 'npm:watch-public',
    name: 'public',
    prefixColor: 'bgYellow.gray.bold'
  },
  {
    command: 'npm:watch-sass',
    name: 'sass',
    prefixColor: 'magenta.bold'
  },
  {
    command: 'npm:watch-entries',
    name: 'webpack',
    prefixColor: 'bgGreen.gray.bold'
  }
], {
  prefix: 'name',
  killOthers: ['failure', 'success'],
  inputStream: process.stdin
})
.then(success => {
  console.log('done');
  process.exit();
})
.catch(err => {
  console.log('quit with err');
  // console.error(err);
});
