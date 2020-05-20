import { GluegunToolbox, GluegunCommand } from 'gluegun';
import { join } from 'path';
import { ensureDir, pathExists, writeFile } from 'fs-extra';
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

    // Set output directory - defaults to public directory
    let outputDir: string;
    if (toolbox.parameters.second) {
      outputDir = join(process.cwd(), toolbox.parameters.second);
    } else {
      const publicDir = join(process.cwd(), 'src', 'client', 'public');
      if (!(await pathExists(publicDir))) {
        toolbox.print.error('Could not find the public directory. Please ensure "./src/client/public" exists.');
        return;
      }
      outputDir = join(publicDir, 'favicons');
    }

    // Start spinner
    const spinner = toolbox.print.spin('Creating favicon set...');

    // Create output directory if it doesn't already exist
    await ensureDir(outputDir);

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

    // Create favicon set
    favicons(
      srcImgPath,
      faviconConfig,
      async (error, response) => {
        // Handle error
        if (error) {
          spinner.fail('Failed to create favicon set');
          toolbox.print.error(error);
          return;
        }

        // Write each generated favicon file
        await Promise.all(
          response.images.map(async (file) => {
            await writeFile(join(outputDir, file.name), file.contents);
          })
        );

        // Stop spinner (success)
        spinner.succeed('Favicon set created');
      }
    );
  }
};

export default faviconGenerator;
