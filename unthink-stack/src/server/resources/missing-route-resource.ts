import { expressResource } from '@epandco/unthink-foundation-express';
import { data, DataResult, view } from '@epandco/unthink-foundation';


export default expressResource({
  name: 'Not Found',
  routes: [
    data('*', {
      'get': async () => DataResult.notFound(),
      'put': async () => DataResult.notFound(),
      'post': async () => DataResult.notFound(),
      'delete': async () => DataResult.notFound()
    }),
    view('*', 'not-found.njk')
  ]
});
