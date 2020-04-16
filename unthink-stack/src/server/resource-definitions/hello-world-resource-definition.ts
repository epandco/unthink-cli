import { data, view } from '../framework/unthink-foundation/resource-definition';
import { expressResource } from '../framework/unthink-foundation-express/express-resource';
import { UnthinkDataResult } from '../framework/unthink-foundation/unthink-data-result';
import { UnthinkViewResult } from '../framework/unthink-foundation/unthink-view-result';

// Gets incremented each request
let counter = 0;

// Complete example showing middleware at all levels
export default expressResource({
  name: 'Hello World resource',
  // Will be applied to ALL calls off of root since the base path is '/' currently
  // including loading of public assets in the test mode in production public folder is offloaded to nginx
  middleware: [
    async (_req, resp, next): Promise<void> => {
      resp.locals.counter = (counter++).toString();
      console.log('resource level:', resp.locals.counter);
      next();
    }
  ],
  routes: [
    view('/', {
      handler: async () => UnthinkViewResult.ok('hello-world.html'),
      middleware: [
        async (_req, resp, next): Promise<void> => {
          console.log('view method level', resp.locals.counter);
          next();
        }
      ]
    }, {
      middleware: [
        async (_req, resp, next): Promise<void> => {
          console.log('view route level', resp.locals.counter);
          next();
        }
      ]
    }),
    data( '/message', {
      'get': {
        handler: async (): Promise<UnthinkDataResult> => UnthinkDataResult.ok({ message: 'hello, world!' }),
        middleware: [
          async (_req, resp, next): Promise<void> => {
            console.log('data method level - first', resp.locals.counter);
            next();
          },
          async (_req, resp, next): Promise<void> => {
            console.log('data method level - second', resp.locals.counter);
            next();
          },
          async (_req, resp, next): Promise<void> => {
            console.log('data method level - third', resp.locals.counter);
            next();
          }
        ]
      }
    }, {
      middleware: [
        async (_req, resp, next): Promise<void> => {
          console.log('data route level - first', resp.locals.counter);
          next();
        },
        async (_req, resp, next): Promise<void> => {
          console.log('data route level - second', resp.locals.counter);
          next();
        }
      ]
    })
  ]
});
