# Unthink Stack Client Workflow

## Browser Support

The client side stack supports most recent browsers, along with IE 11 support
via the necessary transpilation and polyfills. Additional browser support could
be added if needed by adding more polyfills.

There are two polyfill files: one for ES5 support (IE 11) that provides common
polyfills required by the stack such as Promises, and another for ES2015 that
provides polyfills for features that are not yet available to evergreen
browsers (chrome, FF, etc.) including the capability to handle async/await
syntax.

The "nomodule" attribute on the `<script>` tag for the ES5 polyfill causes it
to be ignored by newer browsers. This means that IE will receive both polyfill
files, but newer browsers will only receive the ES2015 polyfill file.

## Development Scripts

The `./scripts` folder includes important development scripts used by the stack
so be careful when modifying them.

The following scripts are important to note because they play a big role in
managing the client code:

- `webpack.common.js`, `webpack.dev.js` and `webpack.prod.js`
- `riot-preprocessors.js` and `riot-typescript-transformer.js`

These will all be covered in sections below.

## Client Workflow Overview

Client code and resources reside under the `./src/client` path.

### Webpack & Entries

Webpack bundles code, and uses webpack-dev-server during development to provide
Hot Module Replacement. There are three Webpack configuration files in the root
`scripts` folder. The `webpack.common.js` configuration serves as the base with
the `webpack.dev.js` and `webpack.prod.js` scripts inheriting from
it.

For more information on Webpack configuration, consult
[Webpack's documentation](https://webpack.js.org/concepts/).

The configuration automatically creates Webpack entries by scanning the
`./src/client/entries` path for subfolders; each subfolder will become an
entry, which means it will become a unique bundle.

Entry folders have a matching TypeScript file and (by default) a matching Riot
component file:

    # For example, 
    # src/client/entries/hello-world
    
    hello-world.ts
    hello-world.riot

The TypeScript file serves as the entry point for the Webpack bundle.

### Polyfills

The two polyfill files are also entries in the Webpack configuration. These
files reside in the `./src/client/polyfills` folder.

These files might need to be modified to fit the needs of your project.

### Sass

The `sass` folder contains project Sass files, and `main.scss` is
the primary style file for the website. Global styles should go here as well as
Sass variables, mixins, functions etc..

### Public Files

The `public` folder is where you put non-bundled assets such as images, fonts
or videos. This folder gets copied as-is to a "public" folder during build.

## npm Scripts

The development environment for the client runs automatically as part of the
`npm start` command, however the following scripts can be run separately by
`npm run ...` if needed:

- `build-client` uses Webpack to create production-ready bundles of the client code
- `build-sass` uses Sass to produce production-ready CSS
- `build-public` copies everything in the `src/client/public` folder
- `lint-client` Runs ESLint on client code
- `lint-sass` Runs StyleLint on Sass files

There are other scripts in the `package.json`; check them out.
