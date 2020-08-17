# Quick Start

This guide will help you get started with the Unthink Stack by using the CLI.

## Installing the CLI

Install from [npm](https://www.npmjs.com/package/@epandco/unthink):

    npm install --global @epandco/unthink

## Initialize a Project

Create a new project off of the current directory:

    unthink init project-name

The CLI will install dependencies for you.

## Run the Project

From the project directory, install dependencies:

    npm install

Build the project:

    npm run build

Then, run the server and client projects in separate terminals:

    npm run server
    npm run client

This builds and runs the server as well as the client side workflow. If you
are using the provided MongoDB Docker instance, run it in a separate terminal:

    docker-compose up

