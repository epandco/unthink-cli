import { GluegunCommand, GluegunToolbox } from 'gluegun';
import * as fsExtra from 'fs-extra';
import * as path from 'path';

const ignorePath = [
  // Exclude specific files
  /.*unthink-stack\/\.env$/,

  // Exclude lib, public, node_modules
  /.*unthink-stack\/lib($|\/.*)/,
  /.*unthink-stack\/public($|\/.*)/,
  /.*unthink-stack\/node_modules($|\/.*)/,
];

const command: GluegunCommand = {
  name: 'initialize',
  alias: ['i', 'init'],
  description: 'Start a new project',

  run: async (toolbox: GluegunToolbox): Promise<void> => {
    const projectName = toolbox.parameters.first;
    const targetPath = `${projectName}`;
    const baseStackDir = path.join(__dirname, '../../unthink-stack');

    // If path exists bail even if it's just an empty directory
    if (await fsExtra.pathExists(targetPath)) {
      toolbox.print.error(`${targetPath} already exists.`);
      return;
    }

    // The filter is to prevent the build output and other
    // initialized files like .env from appearing in the copied output
    //
    // This should never happen in production build but locally this
    // could happen frequently as the unthink-stack dir will commonly
    // be changed into and have npm install ran in it and npm run build
    // to test the stack out.
    await fsExtra.copy(baseStackDir, targetPath, {
      filter: (src: string) => ignorePath.every(path => path.test(src) === false)
    });

    await toolbox.package.loadAndUpdate(
      path.join(targetPath, 'package.json'),
      {
        name: projectName,
        version: '1.0.0',
        license: 'UNLICENSED',
        author: '',
        contributors: [],
        private: true,
        description: '',
        repository: null,
        homepage: null
      }
    );

    // move existing readme to preserve it.
    await fsExtra.move(
      path.join(targetPath, 'README.md'),
      path.join(targetPath, 'UNTHINK.md')
    );

    await toolbox.template.generate({
      template: 'README.md.ejs',
      target: path.join(targetPath, 'README.md'),
      props: { projectName },
    });

    toolbox.print.info('Initialized project');
  },
};

export default command;
