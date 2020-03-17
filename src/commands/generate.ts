import { GluegunToolbox, GluegunCommand } from 'gluegun';

const generate: GluegunCommand = {
  name: 'generate',
  alias: ['g', 'gen'],
  description: 'Generate files from templates',

  run: async (toolbox: GluegunToolbox) => {
    toolbox.print.info('TODO: generators!');
  },
};

export default generate;
