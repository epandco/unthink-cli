import {GluegunToolbox} from 'gluegun';


function toPascalCase(input: string): string {
  return input
    .replace(new RegExp(/[-_]+/, 'g'), ' ')
    .replace(new RegExp(/[^\w\s]/, 'g'), '')
    .replace(
      new RegExp(/\s+(.)(\w+)/, 'g'),
      (_match: string, part1: string, part2: string) => `${part1.toUpperCase() + part2.toLowerCase()}`
    )
    .replace(new RegExp(/\s/, 'g'), '')
    .replace(new RegExp(/\w/), s => s.toUpperCase());
}

/**
 * W3 custom component spec requires that tags have at least 2 words.
 * Should be kebab-case.
 */
function isValidTagName(tagName: string): boolean {
  return tagName.split('-').length >= 2 &&
  /^[a-z][a-z-]+[a-z]+$/.test(tagName) === true;
}

module.exports = async (toolbox: GluegunToolbox): Promise<void> => {

  toolbox.formatters = {
    toPascalCase,
    isValidTagName
  };
};
