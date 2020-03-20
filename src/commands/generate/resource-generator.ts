import { GluegunToolbox, GluegunCommand } from 'gluegun';

const resourceGenerator: GluegunCommand = {
  name: 'resource',
  alias: ['res'],
  hidden: true,
  description: 'Create a new server Resource',

  run: async (toolbox: GluegunToolbox) => {

    toolbox.print.error('TODO: Resource generator needs to be implemented!');
  },
};

export default resourceGenerator;
