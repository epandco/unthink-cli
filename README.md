# unthink CLI

A CLI for unthink.


# Notes

Currently we are using es2019 which doesn't seem to be supported for some reason with ts-node.
So when testing locally via `npm link` you have to run your commands like this:

```
uthink command arg --compiled-build
```

Specifically note the --compiled-build. By default when running locally it tries to use ts-node
out of the src directory to make it easy to do quick changes in typescript and see the result.
It just doesn't like es2019 at the moment. 

## Customizing your CLI

Check out the documentation at https://github.com/infinitered/gluegun/tree/master/docs.

## Publishing to NPM

To package your CLI up for NPM, do this:

```shell
$ npm login
$ npm whoami
$ npm lint
$ npm test
(if typescript, run `npm run build` here)
$ npm publish
```

# License

MIT - see LICENSE

