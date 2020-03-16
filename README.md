# Unthink CLI

This repo contains code for the `unthink` cli tool used to initialize and work with the Unthink stack. In addition, the stack itself
is embedded in this project under `./src/unthink-stack` and is the base template this tool works off of when creating a
new project. The contents of `./src/unthink-stack` are copied verbatim over to the target folder for the new project 
and then modified after via gluegun commands/templates. 

## Quick start

To pull this repo down and test the CLI run the following commands in the repo

```
npm i
npm run build
npm link
```

After those commands are finished you will then be able to run the `unthink` cli as follows

```
# in a new directory somewhere (not in the stack repo please!) you can run
unthink init my-unthinkable-project
```

It will create a directory called `my-unthinkable-project` with the the `unthink-stack` ready to run and where applicable
(e.g package.json) the project name will be set to `my-unthinkable-project`. Please refere to the UNTHINK.md file in the
generated stack for details on how to get started with the Unthink stack.


## The Unthink stack

As noted previously the full stack is embedded in this repo. To maintain and update the base template for the stack
it can be run directly in `./unthink-stack` folder like this

```
# First change directory into the stack folder
cd ./unthink-stack

# npm will not be scoped to this folder and run the npm install for the package.json in this folder
npm i

# run the stack normally

docker-compose up # if you are using the db, skip if not
npm start
```

This way changes can be tested and verified in the stack before committing them. 

## gluegun

This project is using gluegun see the docs [here](https://github.com/infinitered/gluegun/tree/master/docs)

# License

MIT - see LICENSE

