import { appName } from '../config/config';
import { unthinkResource, view, ViewResult } from '@epandco/unthink-foundation';

export default unthinkResource({
  name: 'Version',
  basePath: '/unthink/version',
  routes: [
    view('/', async () => ViewResult.ok('version.html', {
      value: { appName: appName}
    }))
  ]
});
