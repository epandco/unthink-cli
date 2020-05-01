import { appName } from '../config/config';
import { expressResource } from '@epandco/unthink-foundation-express';
import { view, ViewResult } from '@epandco/unthink-foundation';

export default expressResource({
  name: 'Version',
  basePath: '/unthink/version',
  routes: [
    view('/', async () => ViewResult.ok('version.html', {
      value: { appName: appName}
    }))
  ]
});
