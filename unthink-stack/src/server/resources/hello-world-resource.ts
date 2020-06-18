import { unthinkResource, data, DataResult, view } from '@epandco/unthink-foundation';


export default unthinkResource({
  name: 'Root',
  routes: [
    view('/', 'hello-world.njk'),
    data('/message', {
      'get': async () => DataResult.ok({ value: { message: 'Hello, World!'} })
    })
  ]
});
