import { expressResource } from '@epandco/unthink-foundation-express';
import { data, DataResult, view } from '@epandco/unthink-foundation';


export default expressResource({
  name: 'Root definition',
  routes: [
    view('/', 'hello-world.html'),
    data('/message', {
      'get': async () => DataResult.ok({ message: 'Hello, World!'})
    })
  ]
});
