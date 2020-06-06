# Unthink Foundation
The Unthink Foundation package provides a lightweight abstraction over express.

## Core concepts
- Resources
- Routes
    - View Routes
    - Data Routes
- Middleware

## Resources

At the heart of this framework is the concept of a resource. Resources define 
a logical set of http routes that are related. 

If we use a simple todo app as an example then it would be reasonable to have a
`todo` resource. This resource would hold all the http routes pertaining to the
CRUD (Create, Read, Update, Delete) operations for that resource including the
routes that serve up the actual UX for the app.

Here is the start of that `todo` resource. 

```typescript
// src/server/resources/todo-resource.ts

import { unthinkResource } from '@epandco/unthink-foundation';

// Typically export as default for the module
export default unthinkResource({
  name: 'Todo',
  basePath: '/todo',
  routes: [
    // routes go here
  ]
});
```

Then register the resource with the system.

```typescript
// src/server/resource-definitions.ts
// NOTE: this file already exists

// ... 
import TodoResource from './resources/todo-resource';

/** Add new resources to the list below */
export default [
  VersionResource,
  // Simply add the resource to this list.
  // and the TodoResource should just work. 
  TodoResource
];
```

## Routes

Routes are the next logical unit you encounter when defining a resource. Each route defines a path and depending on the
type one or more handlers which is where the logic goes to handle a request. It is important to note that a route
DOES NOT have access to the underlying request in the backing web framework like Express. The unthink-foundation package provides a `RouteContext`
object to the route each time it is called. 

This decision to hide the underlying request was intentional. This abstraction over a general purpose
`web framework` like express allows the removal of some boiler plate while enforcing specific style for things
like API calls.

### Route handlers
All route handlers have the same general signature as seen below in the examples
only differing by the return type based on the kind of route. 

```typescript
// The two signatures
(context: RouteContext): Promise<DataResult> // used in data routes
(context: RouteContext): Promise<ViewResult> // for view routes

// Examples

// The context can be omitted if not being used
view('/todo', async () => ViewResult.ok('todo.html'))
data('/todo', { get: async () => DataResult.Ok({ value: todos }) }) 

// A trivial example with context being used. More detailed examples below
view('/todo', async (ctx) => ViewResult.ok('todo-item.html', { value: { todoId: ctx.query?.id } }))
``` 

Please note the `Promise` in the return type and the use of async in the examples.

### Route Context
Route handlers have only one argument and that is a RouteContext object that is passed in on every call. This object
contains all the needed context from the incoming request and below is a quick overview of the properties.

| Property | description |
|----------|---------|
| query | Contains the query parameters.  |
| params | Houses the path parameters. |
| path | the full path of the route. |
| body | If the request has a body it will be on this property. Typically this is a JSON object being sent by the client. |
| local | Directly mapped to the `response.locals` from the express Response object. Used to pass data between middleware and route handlers. |
| logger | A Pino logger instance. This SHOULD BE used for ALL logging for ANY HTTP requests with no exception. Do not use console.log in route handlers or code called within a route handlers. |
| headers | Access to the incoming headers. |
| cookies | The incoming cookies. |

#### A quick note on the RouteContext.local property
Since version 2.1.0 of `unthink-foundation` the local property is now readonly. Currently, you can't add or remove properties for the `local` object,
and you should NEVER modify any references on this object. 

Quick examples of what Readonly prevents, and the edge cases it can't prevent that SHOULD BE avoided.

```typescript
// local is set to { person: { firstName: ..., lastName ... } }
const local = ctx.local;

// What Readonly prevents:
local.someNewValue = 'Tring to create a new property on local'; // compile time error
local.person = { firstName: '', lastName: '' }; // cant reassign an existing property

// Readonly applies one level deep e.g only the keys/properties on local
// however one can modify properties on sub objects like person.
// This is normal and it's how references works - but again AVOID IT.
const person: Person = local.person;
if (person) {
  person.firstName = 'a new value';
}
```

The proper way to set `local` on the context is using the `local` on the options of the various `Result` objects
based on the route type.

An example using `MiddlewareResult` but applies to `Data` and `View` results as well. 
```typescript
import { MiddlewareResult } from '@epandco/unthink-foundation';

return MiddlewareResult.continue({
  local: { 
    someNewValue: 'Setting a new key on local',
    // overwrites person if it exists
    person: { firstName: 'new value', lastName: 'some' }
  },
});
```

The `local` object returned will be merged with the current `local` and then passed to the next route/middleware handler in the pipeline. 

## View Routes
A view route is defined by using the `view` function provided by the unthink-foundation package and has the
following properties:

- Only works with HTTP GET
- Primary purpose is to render HTML
- As a secondary function it can also issue redirects.

In keeping with the todo app the following are a few potential routes:

```typescript
import { unthinkResource, view, ViewResult } from '@epandco/unthink-foundation';

// Typically export as default for the module
export default unthinkResource({
  name: 'Todo',
  basePath: '/todo',
  routes: [
    // Simple form if all you need to do is render a template
    view('/', 'todo-app.html'),
  
    // Expanded form with access to the RouteContext and control over
    // the response. 
    view('/todo/:todoId', async (ctx) => {
      // If there is no id present redirect to the main todo list
      if (!ctx.params?.todoId) {
        return ViewResult.redirect('/todo');
      }

      return ViewResult.ok('todo-item.html', { 
        // pass in a model to the template engine
        value: { todoId: ctx.params?.todoId }
      });
    })
  ]
});
```

### ViewResult
View routes have to return a ViewResult. This ViewResult class offers up several static helper functions to create
the ViewResult. These functions SHOULD be used vs trying to construct one manually.

Below is a high level breakdown of those functions (for the signatures check out the definition [here](https://github.com/epandco/unthink-foundation/blob/34d86842b915027510d67437c0e8ba91eaee7f66/src/foundation/result.ts#L93):

_Note: All functions below render the supplied template and pass the optional value into the template if supplied._

| function | HTTP Status | purpose |
|----------|-------------|---------|
| ViewResult.ok | 200 | Indicates a successful response. |
| ViewResult.redirect | 302 (default) | Issues a redirect to the target url. To redirect within this app use relative paths. |
| ViewResult.error | 400 | Indicates an error and should normally include an error model to use in the template. |
| ViewResult.notFound | 404 | To convey situations where the route can't find the requested item. |
| ViewResult.unauthorized | 401 | Indicates that this route needs authorization first. |

Each of these functions also allow you to set headers and cookies.

## Data Routes
A data routes defined by the `data` function provided by the unthink-stack package. This route type is for building
JSON API and has the following properties:

- Allows the following HTTP verbs: GET, PUT, POST, DELETE
- The result of the handler is serialized to JSON
- The path specified is automatically prepended with `/api` (this can be overridden)
- Automatically sets the HTTP status code based on the kind of result returned

A very important aspect of this route type is that it tightly controls how the API is presented to the client.

Expanding on the todo example the following would define a basic set of CRUD endpoints for a simple a todo api:

```typescript
import { unthinkResource, data, DataResult } from '@epandco/unthink-foundation';

interface Todo { id: string, name: string }

let nextId = 0;
const todos: Todo[] = [];

// Typically export as default for the module
export default unthinkResource({
  name: 'Todo',
  basePath: '/todo',
  routes: [
    // This is the primary form of this function which differs from the view function slightly
    // with second argument being a map of HTTP verbs that you then specify a handler for
    data('/todo', {
      // Only get and post are relevant for this path
      'get': async () => DataResult.ok({ value: todos }), // OK with a value returns a 200
      'post': async (ctx) => {
        // NOTE: ctx.body should be verified before use, this is only an example.
        const newTodo = ctx.body as Todo;
        newTodo.id = (nextId++).toString();

        todos.push(newTodo);

        return DataResult.ok({ value: newTodo.id });
      }
    }),
    data('/todo/:todoId', {
      'put': async (ctx) => {
        const id = ctx.params?.todoId;
        const model = ctx.body as Todo;

        const todo = todos.find(p => p.id === id);
  
        if (!todo) {
          return DataResult.notFound(); // return a 404
        }

        todo.name = model.name;
        
        return DataResult.ok();
      },
      'delete': async (ctx) => {
        // NOTE: ctx.body should be verified before use, this is only an example.
        const id = ctx.params?.todoId;

        const todoIndex = todos.findIndex(p => p.id === id);
        if (todoIndex < 0) {
          return DataResult.notFound();
        }
 
        return DataResult.ok(); 
      }
    })
  ]
});
```

### DataResult
A data route returns a DataResult. The DataResult class has several static functions that should be used to create
a DataResult object vs trying to create one manually. Below is a high level breakdown of those functions and their role.

To find out more about the signatures reference them [here](https://github.com/epandco/unthink-foundation/blob/34d86842b915027510d67437c0e8ba91eaee7f66/src/foundation/result.ts#L52).

| function | HTTP Status | purpose |
|----------|-------------|---------|
| DataResult.ok | 200 or 204 | Indicates a successful response. If no value is provided a 204 is issued with no body otherwise a 200 is issued with the value in the body. |
| DataResult.redirect | 302 (default) | Issues a redirect to the target url. To redirect within this app use relative paths. |
| DataResult.error | 400 | Indicates an error and requires an value to be returned with the error. |
| DataResult.notFound | 404 | To convey situations where the route can't find the requested item. |
| DataResult.unauthorized | 401 | Indicates that this route needs authorization first. |

All functions can set headers and cookies similar to ViewResult. 

## Middleware

This document is not going to cover the pros/cons of using middleware or diving to deep into the concept but resources 
support adding middleware at various levels. The best way to think about middleware is a pipeline with request start at
the first section and flowing throw all the sections after it till it reaches the end of the pipe.  In this analogy the
sections are functions that each request will be passed to in order one after another. 

### Levels of middleware
1. Resource level: These are defined at the toplevel of the resource.
2. Route level: Each route `view` or `data` can provide middleware via options passed in as the last argument.
3. Method level: Only applicable to data routes which have an alternate form on each HTTP verb handler (shown below). 
   
### Execution order
Middleware defined on a resource is executed in specific predictable pattern in this order:

1. All middleware at the resource level is executed starting from the first item in the middleware array moving onto the next
   item until none are left.
2. Then the middleware is executed for the route that was selected (the one with the matching path) in the same manner.
3. After the middleware on the method level is executed running through each middleware function provided in the array.
4. Lastly the route handler is executed effectively being the last function in the chain. 

#### The exception to this order
All resources have an error handler middleware that is inserted by the unthink-foundation. This handler ensures unhandled
exceptions don't make it back the client and are logged properly. It also is called when a result is 
`error/notFound/unauthorized` to log and render this back to the client. 

For unthink route and middleware handlers this behavior is automatically wired up, HOWEVER for raw middleware it is the responsibility of the 
DEVELOPER to ensure errors are propagated correctly. This will be called out in the examples below.

### UnthinkMiddleware
UnthinkFoundation packages provide an abstraction over underlying middleware where applicable or can be used in cases like AWS Lambda/Azure functions as
the middleware pipeline.

There are a few reasons for this decision:

1. Code is more portable and not tied to a specific underlying middleware implementation (e.g. Express).
2. Follows same semantics as the route handlers and very consistent.
3. For platforms like AWS Lambda/Azure functions where middleware isn't a thing - this abstraction provides that layer. 

This addition now makes it possible for resources to be written once and swap out the backend generators to target various platforms
with no code changes. 

#### Types of middleware
UnthinkMiddleware has a typ which not only expresses the intent of the code but also allows the underlying generator make small optimizations
when building the middleware pipelines for a route. 

#### Types (each item below is the function used to make that type)
- agnosticMiddleware - Not specific to `view` or `data` routes and thus should be inserted in the pipeline for both types. 
- viewMiddleware - Should only apply to `view` routes and not be inserted into `data` routes. 
- dataMiddleware - `data` only middleware and should not be in the `view` route pipeline. 
- rawMiddleware - Not provided by the `UnthinkFoundation` package MUST be provided by the underlying web framework generator package and may not always be present. 

All types except `raw` take in the same `RouteContext` route handlers do and have the following signature:

```typescript
(context: RouteContext): Promise<MiddlewareResult>
```

The underlying type is set by the wrapper functions above and not directly. 
  
### MiddlewareResult
All but `raw` middleware return a `MiddlewareResult`. Just like `ViewResult` and `DataResult` it offers up static functions that should be used to construct
a `MiddlewareResult` instead of directly trying to create it.

To find out more about the signatures reference them [here](https://github.com/epandco/unthink-foundation/blob/34d86842b915027510d67437c0e8ba91eaee7f66/src/foundation/result.ts#L132).

| function | HTTP Status | purpose |
|----------|-------------|---------|
| MiddlewareResult.continue | n/a | Continues to next function in the middleware pipeline. |
| MiddlewareResult.end | n/a | Stops pipeline and returns the value passed in as the body of the request with a given status code. |
| MiddlewareResult.redirect | 302 (default) | Issues a redirect to the target url. To redirect within this app use relative paths. |
| MiddlewareResult.error | 400 | Indicates an error and requires an value to be returned with the error. |
| MiddlewareResult.notFound | 404 | To convey situations where the route can't find the requested item. |
| MiddlewareResult.unauthorized | 401 | Indicates that this route needs authorization first. |

_Note: Only `continute` will advance to the next function and eventually hits a route handler. All others will either stop the pipeline_
immediately (`end` | `redirect`) or bypass the rest of the functions and invoke the error handler.  

All functions can set headers and cookies similar to ViewResult. 

### Putting it all together
Below is a very contrived example demonstrating all but `raw` middleware which is intentionally left out of this document. 

```typescript
import { 
  unthinkResource,
  agnosticMiddleware,
  viewMiddleware,
  dataMiddleware,
  MiddlewareResult,
  data,
  DataResult,
  view,
  ViewResult
} from '@epandco/unthink-foundation';

const viewBumpCount = viewMiddleware(ctx => {
  if (!ctx.local.viewCount) {
    const initialCount = ctx.local.initCount;
    return MiddlewareResult.continue({
      local: { viewCount: initialCount }
    });
  }

  return MiddlewareResult.continue({
    local: { viewCount: ctx.local.viewCount++ }
  });
});

const dataBumpCount = viewMiddleware(ctx => {
  if (!ctx.local.dataCount) {
    const initialCount = ctx.local.initCount;
    return MiddlewareResult.continue({
      local: { viewCount: initialCount }
    });
  }

  return MiddlewareResult.continue({
    local: { dataCount: ctx.local.dataCount++ }
  });
});

const seedCount = agnosticMiddleware(ctx => {
  return MiddlewareResult.continue({ local: { initCount: 2 }});
});

export default unthinkResource({
  name: 'Counter',
  basePath: '/counter',
  // Resource level middleware - called on EVERY route within this resource
  middleware: [
    // First piece of middleware that will be executed
    seedCount, // applied to all route types
    viewBumpCount, // These two only applies on view routes - viewCount after = 3
    dataBumpCount // only applies to data routes - dataCount after = 3
  ],
  routes: [
    view('/', async (ctx) => {
      // finally ctx.local.counter will be 7 here
      return ViewResult.ok('counter.html', { value: { counter: ctx.local?.viewCount } });
    }, { // Config object is the last arg to view and you can specify middleware for this view here
      middleware: [
        viewBumpCount, // viewCount = 4
        viewBumpCount, // viewCount = 5 
        dataBumpCount // viewCount = 6
      ]
    }),
    data('/count', {
      // Unique to data routes. You can further add middleware per HTTP verb.
      // This is not applicable to view routes because they do not have multiple HTTP verbs
      'get': {
        handler: async (ctx) => {
          // ctx.local.counter will be 8 now
          return DataResult.ok({ value: { counter: ctx.local?.dataCount }});
        },
        middleware: [
          dataBumpCount, // dataCount = 5
          dataBumpCount, // dataCount = 6
          dataBumpCount, // dataCount = 7
        ]
      }
    }, { // Similar to view you can add middleware at the route level via the config object
      middleware: [
        viewMiddleware, // will be stripped out of the pipeline silently
        dataBumpCount, // dataCount = 4
      ]
    })
  ]
});
```
