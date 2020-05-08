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

Use the following to start the development environment:

    npm start

This builds and runs the server as well as the client side workflow. If you
are using the provided MongoDB Docker instance, run it in a separate terminal:

    docker-compose up

