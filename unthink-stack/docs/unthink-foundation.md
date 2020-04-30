# Unthink Foundation
The Unthink Foundation package provides a lightweight abstraction over express.

## Core concepts
- Resources
- Routes
    - View Routes
    - Data Routes
- Middlewarewww

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

import { expressResource} from '@epandco/unthink-foundation-express';

// Typically export as default for the module
export default expressResource({
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
DOES NOT have access to the underlying request from express. The unthink-foundation package provides a `RouteContext`
object to the route each time it is called. 

This decision to hide the underlying request was intentional. This abstraction over a general purpose
`web framework` like express allows the removal of some boiler plate while enforcing certain a specific style for things
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

Please note the Promise if the return type and the use of async in the examples.

### Route Context
Route handlers have only one argument and that is a RouteContext object that is passed in on every call. This object
contains all the needed context from the incoming request and below is a quick overview of the properties.

| Property | description |
|----------|---------|
| query | Contains the query parameters.  |
| params | Houses the path parameters. |
| body | If the request has a body it will be on this property. Typically this is a JSON object being sent by the client. |
| local | Directly mapped to the `response.locals` from the express Response object. Used to pass data between middleware and route handlers. |
| logger | A Pino logger instance. This SHOULD BE used for ALL logging for ANY HTTP requests with no exception. Do not use console.log in route handlers or code called within a route handlers. |
| headers | Access to the incoming headers. |
| cookies | The incoming cookies. |

## View Routes
A view route is defined by using the `view` function provided by the unthink-foundation package and has the
following properties:

- Only works with HTTP GET
- Primary purpose is to render HTML
- As a secondary function it can also issue redirects.

In keeping with the todo app the following are a few potential routes:

```typescript
import { expressResource} from '@epandco/unthink-foundation-express';
import { view, ViewResult } from '@epandco/unthink-foundation';

// Typically export as default for the module
export default expressResource({
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

Below is a high level breakdown of those functions (for the signatures check out the definition [here](https://github.com/epandco/unthink-foundation/blob/master/src/foundation/result.ts#L89):

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
import { expressResource} from '@epandco/unthink-foundation-express';
import { data, DataResult } from '@epandco/unthink-foundation';

interface Todo { id: string, name: string }

let nextId = 0;
const todos: Todo[] = [];

// Typically export as default for the module
export default expressResource({
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

To find out more about the signatures reference them [here](https://github.com/epandco/unthink-foundation/blob/master/src/foundation/result.ts#L51).

| function | HTTP Status | purpose |
|----------|-------------|---------|
| DataResult.ok | 200 or 204 | Indicates a successful response. If no value is provided a 204 is issued with no body otherwise a 200 is issued with the value in the body. |
| DataResult.error | 400 | Indicates an error and requires an value to be returned with the error. |
| DataResult.notFound | 404 | To convey situations where the route can't find the requested item. |
| DataResult.unauthorized | 401 | Indicates that this route needs authorization first. |

All functions can set headers and cookies similar to ViewResult. 


