import { GluegunToolbox, GluegunCommand } from 'gluegun';
import {ensureDir, pathExists} from 'fs-extra';
import {join, dirname} from 'path';

const changelogGenerator: GluegunCommand = {
  name: 'changelog',
  hidden: true,
  description: 'CHANGELOG.md template',

  run: async (toolbox: GluegunToolbox) => {

    const outputPath = toolbox.parameters.first || './';

    const fullFilePath = join(outputPath, 'CHANGELOG.md');

    // Require component with that name does not already exist
    if (await pathExists(fullFilePath)) {
      toolbox.print.error('CHANGELOG.md file already exists.');
      return;
    }

    const spinner = toolbox.print.spin('Creating Changelog.');

    // make sure path exists
    await ensureDir(dirname(fullFilePath));

    // create entry Riot file
    await toolbox.template.generate({
      template: 'changelog/CHANGELOG.md.ejs',
      target: fullFilePath,
      props: {}
    });

    spinner.succeed(`Changelog created at "${fullFilePath}".`);
  },
};

export default changelogGenerator;
