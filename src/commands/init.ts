import { GluegunCommand, GluegunToolbox } from 'gluegun';
import * as fsExtra from 'fs-extra';
import * as path from 'path';

const ignorePath = [
  'unthink-stack/lib/',
  'unthink-stack/public/',
  'unthink-stack/node_modules/',
];


const command: GluegunCommand = {
  name: 'init',
  alias: ['i'],
  description: 'Start a new project',

  run: async (toolbox: GluegunToolbox): Promise<void> => {
    const projectName = toolbox.parameters.first;
    const targetPath = `./${projectName}`;
    const baseStackDir = path.join(__dirname, '../../unthink-stack');

    try {
      const existingFiles = await fsExtra.readdir(targetPath);
      if (existingFiles.length > 0) {
        toolbox.print.error(`${ path.resolve(targetPath) } is not empty.`);
        return;
      }
    } catch (e) {
      // lets just assume it's not a directory and move on.
    }

    try {
      await fsExtra.ensureDir(targetPath);
    } catch (e) {
      toolbox.print.error(`${ path.resolve(targetPath) } is not empty.`);
      return;
    }

    await fsExtra.copy(baseStackDir, targetPath, {
      filter: (src: string) => {
        for (const path of ignorePath) {
          if (src.toLowerCase().includes(path.toLowerCase())) {
            return false;
          }
        }

        // This is temporary, but has to be handled differently
        // than others because .eng.local and .env.prod match
        // the includes functions above which is expected
        if (src.toLowerCase().endsWith('unthink-stack/.env')) {
          return false;
        }

        return true;
      }
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
