import { expressResource } from '@epandco/unthink-foundation-express';
import { data, DataResult, view } from '@epandco/unthink-foundation';


export default expressResource({
  name: 'Root',
  routes: [
    view('/', 'hello-world.njk'),
    data('/message', {
      'get': async () => DataResult.ok({ value: { message: 'Hello, World!'} })
    })
  ]
});
