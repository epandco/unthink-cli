# Unthink Stack

The Unthink Stack is an Express-based, full-stack web development framework.
You write code for the server and the client in TypeScript, allowing for
shared knowledge for both.

## Core Features

- [Typescript](https://www.typescriptlang.org/)
- [MongoDB](https://www.mongodb.com/) ready-to-use for local development with [Docker](https://www.docker.com/)
- [Nunjucks](https://mozilla.github.io/nunjucks/) for template processing
- [Webpack](https://webpack.js.org) for bundling client code with Hot Module Replacement
- [Riot.js](https://riot.js.org) component library
- [Sass](https://sass-lang.com/)
- Linting for full stack via [ESLint](https://eslint.org/) and [Stylelint](https://stylelint.io/)
- [Environment-based configuration](https://12factor.net/config)

## Requirements

- Latest LTS version of [Node](https://nodejs.org/en/about/releases/).
- Docker (for Mongodb local development)
  - [For Windows](https://download.docker.com/win/stable/Docker%20for%20Windows%20Installer.exe)
  - [For macOS](https://download.docker.com/mac/stable/Docker.dmg)
- SSL Cert: this stack uses HTTPS and requires having an SSL cert for `localhost`.

Other project dependencies will be managed by `npm`.

## Documentation

- [Getting Started Quickly by Using the CLI](../../README.md)
- [Server Fundamentals](./unthink-foundation.md)
- [Client Workflow](./client-workflow.md)

