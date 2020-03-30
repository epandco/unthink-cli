import { GluegunToolbox, GluegunCommand } from 'gluegun';
import {resolve } from 'path';

const generate: GluegunCommand = {
  name: 'generate',
  alias: ['g', 'gen'],
  description: 'Generate files from templates',

  run: async (toolbox: GluegunToolbox) => {

    // The default "generate" command lists out all available generators.

    const fileList = (await toolbox.filesystem.list(resolve(__dirname)))
      .filter((fileName: string) => fileName !== 'generate.js');

    const listing = [
      ['Generator', 'Description']
    ];

    for (const fileName of fileList) {
      const modulePath = resolve(__dirname, fileName);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const subCommand = require(modulePath).default;
      listing.push([
        subCommand.name, subCommand.description
      ]);
    }

    toolbox.print.table(listing, {
      format: 'lean'
    });
  },
};

export default generate;
