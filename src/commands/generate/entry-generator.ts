import { GluegunToolbox, GluegunCommand } from 'gluegun';
import { join } from 'path';
import {pathExists, ensureDir} from 'fs-extra';



const entryGenerator: GluegunCommand = {
  name: 'entry',
  alias: ['e'],
  hidden: true,
  description: 'Create a new Webpack entry',

  run: async (toolbox: GluegunToolbox) => {
    // Require project
    // TODO: move this to an extension
    if (!(await pathExists(join(process.cwd(), 'package.json')))) {
      toolbox.print.error('This command must be run from the root of a project.');
      return;
    }

    // Require destination exists
    const entriesBasePath = join(process.cwd(), 'src', 'client', 'entries');
    if (!(await pathExists(entriesBasePath))) {
      toolbox.print.error('Could not determine entries location. Tried "./src/client/entries/".');
      return;
    }

    // Require valid name input
    if (!toolbox.parameters.first) {
      // require the name for the entry!
      toolbox.print.error('You must provide a name for the new entry!');
      toolbox.print.info('e.g. "home-page".');
      return;
    }

    const forcedLowerCase = toolbox.parameters.first.toLowerCase();

    // require W3 spec compliant name
    // e.g., "home-page" not "homepage"
    // e.g., "home-page" not "home-page.riot"
    if (!toolbox.formatters.isValidTagName(forcedLowerCase)) {
      toolbox.print.error(`"${toolbox.parameters.first}" is not a valid entry name.`);
      return;
    }

    // Require entry with that name does not already exist
    const entryFolderPath = join(entriesBasePath, forcedLowerCase);
    if (await pathExists(join(entriesBasePath, forcedLowerCase))) {
      toolbox.print.error(`An entry with the name "${forcedLowerCase}" already exists for this project.`);
      return;
    }

    const riotFileName = `${forcedLowerCase}.riot`;
    const entryFileName = `${forcedLowerCase}.ts`;
    const pascalComponentName = toolbox.formatters.toPascalCase(forcedLowerCase);

    const spinner = toolbox.print.spin('Creating new entry.');

    // create entry folder
    await ensureDir(entryFolderPath);

    // create entry TS file
    await toolbox.template.generate({
      template: 'entry/entry.ts.ejs',
      target: join(entryFolderPath, entryFileName),
      props: {
        name: pascalComponentName,
        tag: forcedLowerCase
      }
    });

    // create entry Riot file
    await toolbox.template.generate({
      template: 'entry/entry.riot.ejs',
      target: join(entryFolderPath, riotFileName),
      props: {
        name: pascalComponentName,
        tag: forcedLowerCase
      }
    });

    spinner.succeed(`Entry "${pascalComponentName}" created.`);
  },
};

export default entryGenerator;
