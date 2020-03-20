import { GluegunToolbox, GluegunCommand } from 'gluegun';

const riotGenerator: GluegunCommand = {
  name: 'riot',
  alias: ['r'],
  hidden: true,
  description: 'Create a new Riot Component',

  run: async (toolbox: GluegunToolbox) => {

    toolbox.print.error('TODO: Riot component generator needs to be implemented!');
  },
};

export default riotGenerator;
