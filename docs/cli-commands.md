# CLI Commands

## help

`help` (alias `h`) will output the list of commands.

## initialize

`initialize` (aliases `init` and `i`) is used to start a new project.

You must provide a valid project name (kebab-case) and optionally the path for
the new project.

Examples:

    # create "my-new-project" off of current directory:
    unthink init my-new-project
    
    # create "my-new-project" off of the path specified:
    unthink init path/to/my-new-project

## generate

The `generate` (aliases `gen` and `g`) command aids day-to-day project work by
creating certain common project elements from templates.

Using the command by itself will output a list of available generators:

    unthink gen

Following are built-in generators provided with the CLI.

### entry

The `entry` generator adds a new entry point for Webpack in the frontend layer.
Entries go in the `src/client/entries` folder and are made up of (by default) a
TypeScript file and Riot component. This command must be run from a project's
root. Entry names must be kebab-case and at least two words in length (forced
style to match the W3 spec on custom components).

    unthink gen entry about-page

### riot

The `riot` generator adds a new Riot component at the path specified. Component
names must be kebab-case and at least two words in length (forced style to match
the W3 spec on custom components).

By default, the new Riot Component will include the `<script type="ts">` and
`<style type="scss">` blocks:

    unthink gen riot ./some/path/my-new-component

Use the `--no-script` option flag to skip generating the `<script>` block.

Use the `--no-style` option flag to skip generating the `<style>` block. 
