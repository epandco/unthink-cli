import { GluegunCommand, GluegunToolbox } from 'gluegun';

const command: GluegunCommand = {
  name: 'unthink',
  run: async (toolbox: GluegunToolbox) => {
    toolbox.print.info('Unthink');
  },
};

module.exports = command;
