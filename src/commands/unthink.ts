import { GluegunCommand, GluegunToolbox } from 'gluegun';

const command: GluegunCommand = {
  name: 'unthink',
  run: async (toolbox: GluegunToolbox) => {
    toolbox.print.info(`Unthink ${toolbox.meta.version()}`);
  },
};

module.exports = command;
