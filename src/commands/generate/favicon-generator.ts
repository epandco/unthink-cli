import { GluegunToolbox, GluegunCommand } from 'gluegun';
import { join } from 'path';
import { pathExists, writeFile, ensureDir } from 'fs-extra';
import * as favicons from 'favicons';

const faviconGenerator: GluegunCommand = {
  name: 'favicon',
  alias: ['fav'],
  hidden: true,
  description: 'Create favicon set',

  run: async (toolbox: GluegunToolbox) => {
    // Require source image path
    if (!toolbox.parameters.first) {
      toolbox.print.error('You must provide a path to the source image!');
      return;
    }

    // Check if source path exists
    const srcImgPath = join(process.cwd(), toolbox.parameters.first);
    if (!(await pathExists(srcImgPath))) {
      toolbox.print.error('Could not find the provided source image.');
      return;
    }

    // Check if public directory exists (src/client/public)
    const publicDir = join(process.cwd(), 'src', 'client', 'public');
    if (!(await pathExists(publicDir))) {
      toolbox.print.error('Could not find the public directory. Please ensure "./src/client/public" exists.');
      return;
    }

    // Create favicon directory
    const faviconDir = join(publicDir, 'favicons');
    await ensureDir(faviconDir);

    // Favicons options
    const faviconConfig = {
      icons: {
        appleStartup: false,
        coast: false,
        firefox: false,
        windows: false,
        yandex: false
      }
    };

    const spinner = toolbox.print.spin('Creating favicon set...');

    // Create favicon set
    favicons(
      srcImgPath,
      faviconConfig,
      async (error, response) => {
        if (error) {
          spinner.fail('Failed to create favicon set');
          return;
        }

        // Write each generated favicon file
        await Promise.all(
          response.images.map(async (file) => {
            await writeFile(join(faviconDir, file.name), file.contents);
          })
        );

        spinner.succeed('Favicon set created');
      }
    );
  }
};

export default faviconGenerator;
