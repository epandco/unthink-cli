/* eslint-disable no-console, @typescript-eslint/no-var-requires, fp/no-loops, fp/no-mutating-methods */

/**
 * Quick typescript types checker for riot tags
 */

const ts = require('typescript');
const path = require('path');
const fs = require('fs');

// This needs to be set to the path of file that contains the module definition
// for "*.riot" files.
const RIOT_FILE_TYPINGS = path.join(process.cwd(), 'src', 'client', 'typings.d.ts');
const CLIENT_ROOT_PATH = path.join(process.cwd(), 'src', 'client');

/**
 * Custom module resolver for the TypeScript compiler.
 * https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#customizing-module-resolution
 * @param {Array[string]} moduleNames list of module names that need to be resolved
 * @param {string} containingFile File that contains the references to the modules needing to be resolved
 * @param {*} fileRoot Root file path
 * @param {*} compilerOptions TypeScript compiler options
 * @returns {Array[object]} list of resolved modules
 */
function resolveModuleNames(
  moduleNames,
  containingFile,
  fileRoot,
  compilerOptions
) {
  const moduleSearchLocations = [fileRoot];
  const moduleExtensions = ['.d.ts', '.ts', '.riot'];
  const resolvedModules = [];

  for (const moduleName of moduleNames) {
    // try to use the default TypeScript resolver first
    const result = ts.resolveModuleName(moduleName, containingFile, compilerOptions, {
      fileExists: ts.sys.fileExists,
      readFile: ts.sys.readFile
    });

    // If the default resolver found the module, add the module to the list;
    // otherwise, doing custom resolution. This is so we can handle custom
    // files like other Riot tags.
    if (result.resolvedModule) {
      resolvedModules.push(result.resolvedModule);
    } else {
      // check fallback locations
      let foundModule = false;
      for (const location of moduleSearchLocations) {
        for (const extension of moduleExtensions) {
          const fullPath = path.resolve(path.join(location, path.dirname(moduleName)));
          const basename = path.basename(moduleName, extension);
          const modulePath = path.join(fullPath, `${basename}${extension}`);

          if (ts.sys.fileExists(modulePath)) {
            resolvedModules.push({
              resolvedFileName: modulePath,
              extension,
              isExternalLibraryImport: false
            });
            foundModule = true;
            break;
          }
        }
        if (foundModule) {
          break;
        }
      }
    }
  }

  return resolvedModules;
}

// Load the configuration from the tsconfig
const config = JSON.parse(fs.readFileSync(path.join(CLIENT_ROOT_PATH, 'tsconfig.json')).toString());
const compilerOptions = ts.parseJsonConfigFileContent(config, ts.sys, CLIENT_ROOT_PATH).options;

module.exports = function check(sourceFile, contents, fileRoot) {
  /* eslint-disable */
  // Any compiled code will be stored in `output`
  let output;
  // Any compiled sourcemaps will be stored in `map`
  let map;
  /* eslint-enable */

  const sourceFileWithoutExtension = sourceFile.replace('ts', '');

  // Create a compilerHost object to allow the compiler to read and write files
  const compilerHost = {
    getSourceFile: function (filename, languageVersion) {
      if (filename === sourceFile) {
        return ts.createSourceFile(filename, contents, config.target, '0');
      }

      const sourceText = ts.sys.readFile(filename);
      return sourceText !== undefined
        ? ts.createSourceFile(filename, sourceText, languageVersion)
        : undefined;
    },
    writeFile: (name, text) => {
      // write out to output or sourcemap depending on the data
      name = path.basename(name);
      if (name.replace('js', '') === sourceFileWithoutExtension) {
        output = text;
      }
      if (name.replace('js.map', '') === sourceFileWithoutExtension) {
        map = text;
      }
    },
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getCompilationSettings: () => compilerOptions,
    getDefaultLibFileName: ts.getDefaultLibFilePath,
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    getNewLine: () => ts.sys.newLine,
    getCanonicalFileName: fileName =>
      ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase(),
    useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
    resolveModuleNames: (moduleNames, containingFile) => resolveModuleNames(
      moduleNames,
      containingFile,
      fileRoot,
      compilerOptions
    )
  };

  // Create a program from inputs
  const program = ts.createProgram([
    RIOT_FILE_TYPINGS,
    sourceFile
  ], compilerOptions, compilerHost);
  const emitResult = program.emit();
  const allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  // formatted console log of errors
  if (allDiagnostics.length > 0) {
    console.log(ts.formatDiagnosticsWithColorAndContext(allDiagnostics, compilerHost));
  }

  return {diagnostics: allDiagnostics, code: output, map};
};
