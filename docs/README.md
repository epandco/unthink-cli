# Unthink CLI

The Unthink CLI is a tool to make creating and working in projects utilizing
the Unthink Stack easier.

The Unthink Stack is a specialized web stack built on top of Express with both
the server and client code written in TypeScript. For more information on the
stack see its [documentation](../unthink-stack/docs/unthink-stack.md).

## Quick Start

Install from [npm](https://www.npmjs.com/package/@epandco/unthink):

    npm install --global @epandco/unthink


Create a new project off of the current directory:

    unthink init project-name

From the project directory, install dependencies:

    npm install

Run the project:

    npm start

If the project is using MongoDB via the provided docker configuration,
you should also run the following in a new terminal:

    docker-compose up

## CLI Commands

### help

`help` (alias `h`) will output the list of commands.

### initialize

`initialize` (aliases `init` and `i`) is used to start a new project.

You must provide a valid project name (kebab-case) and optionally the path for
the new project.

Examples:

    # create "my-new-project" off of current directory:
    unthink init my-new-project
    
    # create "my-new-project" off of the path specified:
    unthink init path/to/my-new-project

### generate

The `generate` (aliases `gen` and `g`) command aids day-to-day project work by
creating certain common project elements from templates.

Using the command by itself will output a list of available generators:

    unthink gen

Following are built-in generators provided with the CLI.

#### entry

The `entry` generator adds a new entry point for Webpack in the frontend layer.
Entries go in the `src/client/entries` folder and are made up of (by default) a
TypeScript file and Riot component. This command must be run from a project's
root. Entry names must be kebab-case and at least two words in length (forced
style to match the W3 spec on custom components).

    unthink gen entry about-page

#### riot

The `riot` generator adds a new Riot component at the path specified. Component
names must be kebab-case and at least two words in length (forced style to match
the W3 spec on custom components).

By default, the new Riot Component will include the `<script type="ts">` and
`<style type="scss">` blocks:

    unthink gen riot ./some/path/my-new-component

Use the `--no-script` option flag to skip generating the `<script>` block.

Use the `--no-style` option flag to skip generating the `<style>` block. 

## Contributing

Bugs, questions, enhancement ideas, proposals etc., should all be handled via
this repo's [issues board](https://github.com/epandco/unthink-cli/issues).

Try to give as much detail as you can, and use the labels.

### Developing and running the CLI locally

To pull this repo down and test the CLI, run the following commands in the repo:

```
npm install
npm run build
npm link
```

Note: if you already have the CLI installed globally from npm, you should
uninstall it first.

After those commands finish you will then be able to run the `unthink` CLI as
if you had installed it globally from npm.

### Submitting Updates

Make a pull request with your changes. Make sure to reference any related
issues if they exist!

Note: make sure you've properly followed the project style and linted before
making your PR.

## The Unthink Stack

For the documentation on how the stack works and how to use it,
look [here](unthink-foundation.md).

The template for the Unthink Stack is part of this repo (in `./unthink-stack`).
The CLI uses this template when creating new projects with the `initialize`
command.

To maintain and update this template, it can be run directly in
`./unthink-stack` folder like this:

    # First change directory into the stack folder
    cd ./unthink-stack
    
    # npm will not be scoped to this folder and run the npm install for the
    # package.json in this folder
    npm i
    
    # run the stack normally
    
    # if you are using the db, skip if not
    docker-compose up
    
    npm start


This way changes can be tested and verified in the stack before committing them. 

## gluegun

This project is using gluegun see the docs
[here](https://github.com/infinitered/gluegun/tree/master/docs).

# License

MIT - see [LICENSE](LICENSE)
