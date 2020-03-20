import { GluegunToolbox } from 'gluegun';
import { readJSON, writeJSON } from 'fs-extra';


async function load(packagePath: string): Promise<Record<string, unknown>> {
  return await readJSON(packagePath);
}

async function write(packageJSON: Record<string, unknown>, packagePath: string): Promise<void> {
  await writeJSON(packagePath, packageJSON, {
    spaces: 2
  });
}

/**
 * Loads, updates, writes and then returns the package.
 * @param packagePath
 * @param updates
 */
async function loadAndUpdate(packagePath: string, updates: Record<string, unknown>): Promise<Record<string, unknown>> {
  const packageJSON = await load(packagePath);
  for (const key in updates) {
    if ((updates[key] === null || updates[key] === undefined)) {
      // if key is null or undefined, then _remove_ from package
      if (packageJSON.hasOwnProperty(key)) {
        delete packageJSON[key];
      }
    } else {
      packageJSON[key] = updates[key];
    }
  }
  await write(packageJSON, packagePath);
  return packageJSON;
}

module.exports = async (toolbox: GluegunToolbox): Promise<void> => {

  toolbox.package = {
    load,
    write,
    loadAndUpdate
  };
};
