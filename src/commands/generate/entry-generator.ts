import { GluegunToolbox, GluegunCommand } from 'gluegun';

const entry: GluegunCommand = {
  name: 'entry',
  hidden: true,

  run: async (toolbox: GluegunToolbox) => {

    toolbox.print.info('TODO: entry generator should make entries!');
  },
};

export default entry;
