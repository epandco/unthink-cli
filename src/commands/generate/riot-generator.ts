import { GluegunToolbox, GluegunCommand } from 'gluegun';
import {ensureDir, pathExists} from 'fs-extra';
import {join, basename, dirname} from 'path';

const riotGenerator: GluegunCommand = {
  name: 'riot',
  alias: ['r'],
  hidden: true,
  description: 'Create a new Riot Component',

  run: async (toolbox: GluegunToolbox) => {

    // Require valid name input
    if (!toolbox.parameters.first) {
      // require the name for the entry!
      toolbox.print.error('You must provide a path and tag name for the new component!');
      toolbox.print.info('e.g. "custom-widget".');
      return;
    }

    const forcedLowerCase = basename(toolbox.parameters.first).toLowerCase();

    // require W3 spec compliant name
    // e.g., "home-page" not "homepage"
    // e.g., "home-page" not "home-page.riot"
    if (!toolbox.formatters.isValidTagName(forcedLowerCase)) {
      toolbox.print.error(`"${toolbox.parameters.first}" is not a W3-compliant tag name.`);
      return;
    }

    const riotFileName = `${forcedLowerCase}.riot`;
    const fullFilePath = join(dirname(toolbox.parameters.first), riotFileName);

    // Require component with that name does not already exist
    if (await pathExists(fullFilePath)) {
      toolbox.print.error(`An component with the name "${forcedLowerCase}" already exists.`);
      return;
    }

    const pascalComponentName = toolbox.formatters.toPascalCase(forcedLowerCase);

    const spinner = toolbox.print.spin('Creating new Riot component.');

    // make sure path exists
    await ensureDir(dirname(toolbox.parameters.first));

    // create entry Riot file
    await toolbox.template.generate({
      template: 'riot/riot.riot.ejs',
      target: fullFilePath,
      props: {
        name: pascalComponentName,
        tag: forcedLowerCase,
        script: !toolbox.parameters.options.hasOwnProperty('script') ? true : toolbox.parameters.options.script,
        style: !toolbox.parameters.options.hasOwnProperty('style') ? true : toolbox.parameters.options.style
      }
    });

    spinner.succeed(`Riot component "${pascalComponentName}" created.`);
  },
};

export default riotGenerator;
