# Unthink Stack


## Features

-[x] Full-stack Typescript solution
-[x] Mongodb
-[x] Nunjucks for template processing
-[x] Webpack for bundling client code with HMR
-[x] Sass
-[x] Linting for full stack via ESLint and Stylelint
-[x] Docker support with docker-compose
-[x] Express-based server with Resource Generator package
-[x] Environment-based configuration
-[x] Authentication middleware
-[x] Readme documentation

### Browser Support

The client side stack supports most recent browsers, along with IE 11 support
via the necessary transpilation and polyfills.

There are two polyfill files: one for ES5 support (IE 11) that provides common
polyfills required by the stack such as Promises, and another for ES2015 that
provides polyfills for features that are not yet available to evergreen
browsers (chrome, FF, etc.) including the capability to handle async/await
syntax.

The ES5 file is served up with the "nomodule" attribute, causing it to be
ignored by newer browsers. This means that IE will receive both polyfill
files, but newer browsers will only receive the ES2015 polyfill file.

## Installation

### Requirements

- Latest LTS version of [Node](https://nodejs.org/en/about/releases/).
- Docker (for Mongodb local development)
  - [For Windows](https://download.docker.com/win/stable/Docker%20for%20Windows%20Installer.exe)
  - [For macOS](https://download.docker.com/mac/stable/Docker.dmg)

### Setup new project

_It is best to start with an empty folder/repo before starting._

Download or clone this repo and copy all of the files into your project's repo
(don't copy the .git folder if you cloned this repo). _MacOS users, make sure
you copy the many hidden files such as `.eslintrc`_. 

In the `package.json` file, alter the following fields with the correct information:

- `name`: Enter the project's package name (all lowercase with dashes)
- `version`: Set the starting version for your project
- `description`: Provide a description for your project

Install dependencies:

    npm install

### Configuration and Environment Variables

Copy the example `.env.local` file to `.env`. If you need to make adjustments to the
configuration for your project, make your changes in `.env`; it should never
be checked into your repo.

The server should be [configured via environment variables](https://www.12factor.net/config).
For documentation on the configuration options, check the example config,
located in `.env.local`.

### HTTPS

This stack requires having a SSL cert for `localhost`.

## Local Development
 
The NPM package comes ready with script commands for running the development
server. To run the entire stack use the following command:

    npm start

This will build the project and then use Concurrently to run the following:

- Run the server with Nodemon for auto-restarting after changes are made
- Use `tsc` to watch for changes to the server code and build
- Webpack is run from the server and handles the front-end TypeScript code,
including hot module reloading
- Sass is run in watch mode to build and rebuild the client styles as needed
- Monitor content path for changes and copy files

To run the mongodb database, use:

    docker-compose up

_Note: the first time docker runs, it will take longer to start as it has
to download images and build containers._

## Linting

### Code

ESLint is used to lint the server and client codebases. The rules are defined
in `.eslintrc` in the root directory, and exceptions are in `.eslintignore`.

### Styles

Stylelint is used for the CSS and Sass, both for the `client/sass/` directory
and any styles inside Riot tags. `.stylelintrc` is located in the `src/client`
directory.
