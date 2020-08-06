import { GluegunCommand, GluegunPrint, GluegunToolbox } from 'gluegun';
import * as fsExtra from 'fs-extra';
import * as path from 'path';

const ignorePath = [
  // Exclude specific files
  /.*unthink-stack\/\.env$/,

  // Exclude lib, public, node_modules
  /.*unthink-stack\/lib($|\/.*)/,
  /.*unthink-stack\/public($|\/.*)/,
  /.*unthink-stack\/node_modules($|\/.*)/,
];

const projectNamePattern = /^[a-z0-9-]+$/;

function printProjectNameError(print: GluegunPrint, additionalMessage: string): void {
  const projectNameRequirements = [
    additionalMessage,
    '',
    'Project name must be lower case containing only letters (a-z), numbers (0-9) and dashes (-).',
    'The name can contain the full path to the destination folder which will be the project name rules still apply.',
    '',
    'example: foo/bar/my-new-project.'
  ];

  for (const line of projectNameRequirements) {
    print.error(line);
  }
}

const command: GluegunCommand = {
  name: 'initialize',
  alias: ['i', 'init'],
  description: 'Start a new project',

  run: async (toolbox: GluegunToolbox): Promise<void> => {
    const projectPath = toolbox.parameters.first;
    const force: boolean = toolbox.parameters.options.force;

    if (!projectPath) {
      printProjectNameError(toolbox.print, 'Project name not specified.');
      return;
    }

    const projectName = path.basename(projectPath);
    if (!projectNamePattern.test(projectName)) {
      printProjectNameError(toolbox.print, `${projectName} is invalid.`);
      return;
    }

    if (force) {
      const response = await toolbox.prompt.confirm(
        'Are you sure you want to force initialization? (overwrites files in destination)',
        false
      );

      if (!response) {
        return;
      }
    }

    const targetPath = `${projectPath}`;
    const baseStackDir = path.join(__dirname, '../../unthink-stack');


    // Unless the user is forcing creation
    // bail even if the path exists even if it's just an empty directory
    if (!force && await fsExtra.pathExists(targetPath)) {
      toolbox.print.error(`${targetPath} already exists.`);
      return;
    }

    const spinner = toolbox.print.spin(`Creating project at ${targetPath}`);

    // The filter is to prevent the build output and other
    // initialized files like .env from appearing in the copied output
    //
    // This should never happen in production build but locally this
    // could happen frequently as the unthink-stack dir will commonly
    // be changed into and have npm install ran in it and npm run build
    // to test the stack out.
    await fsExtra.copy(baseStackDir, targetPath, {
      overwrite: force,
      errorOnExist: !force,
      filter: (src: string) => ignorePath.every(path => path.test(src) === false)
    });

    // NPM does not keep the .gitignore in the unthink-stack when it installs the CLI/
    // So as a workaround the unthink-stack/.gitignore is copied to unthink-stack/.stack-gitignore
    // and needs to be moved back to .gitignore in the target
    const stackGitIgnore = path.join(targetPath, '.stack-gitignore');
    const targetGitignore = path.join(targetPath, '.gitignore');

    await fsExtra.move(stackGitIgnore, targetGitignore, { overwrite: true });

    await toolbox.package.loadAndUpdate(
      path.join(targetPath, 'package.json'),
      {
        name: projectName,
        version: '1.0.0',
        license: 'UNLICENSED',
        author: '',
        contributors: [],
        private: true,
        description: '',
        repository: null,
        homepage: null,
        unthink: {
          version: toolbox.meta.version()
        }
      }
    );

    // move existing readme to preserve it.
    await fsExtra.move(
      path.join(targetPath, 'README.md'),
      path.join(targetPath, 'UNTHINK.md'),
      {
        overwrite: force
      }
    );

    console.log('after move');

    // init .env file from the env.local file

    await fsExtra.copy(
      path.join(targetPath, '.env.local'),
      path.join(targetPath, '.env'),
      {
        overwrite: force
      }
    );

    await toolbox.template.generate({
      template: 'README.md.ejs',
      target: path.join(targetPath, 'README.md'),
      props: { projectName },
    });

    await toolbox.system.exec('npm install',  { cwd: targetPath });

    spinner.succeed('Initialized project');
  },
};

export default command;
