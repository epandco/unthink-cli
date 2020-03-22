import { GluegunToolbox, GluegunCommand } from 'gluegun';
import { join } from 'path';
import {pathExists, ensureDir} from 'fs-extra';

// TODO: move this to extension
function toPascalCase(input: string): string {
  return `${input}`
    .replace(new RegExp(/[-_]+/, 'g'), ' ')
    .replace(new RegExp(/[^\w\s]/, 'g'), '')
    .replace(
      new RegExp(/\s+(.)(\w+)/, 'g'),
      (_match: string, part1: string, part2: string) => `${part1.toUpperCase() + part2.toLowerCase()}`
    )
    .replace(new RegExp(/\s/, 'g'), '')
    .replace(new RegExp(/\w/), s => s.toUpperCase());
}

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
    if (forcedLowerCase.split('-').length < 2 ||
      /^[a-z][a-z-]+[a-z]+$/.test(forcedLowerCase) === false) {
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
    const pascalComponentName = toPascalCase(forcedLowerCase);

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
