import { GluegunToolbox, GluegunCommand } from 'gluegun';

const entryGenerator: GluegunCommand = {
  name: 'entry',
  alias: ['e'],
  hidden: true,
  description: 'Create a new Webpack entry',

  run: async (toolbox: GluegunToolbox) => {

    toolbox.print.error('TODO: entry generator should make entries!');
  },
};

export default entryGenerator;
