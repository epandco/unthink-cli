#!/bin/bash

# install dependencies
npm install

# run build scripts
npm run build-server
npm run build-public
npm run build-sass
npm run build-client
npm run build-content

# copy production environment file
cp ./.env.production ./.env
