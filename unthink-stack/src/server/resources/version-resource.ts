import { resource, template, TemplateResponse, RedirectResponse } from 'resource-decorator';
import { ResourceBase } from './resource-base';
import { appName } from '../config/config';

@resource({ basePath: '/unthink/version' })
export class VersionResource extends ResourceBase {

  @template()
  async versionPage(): Promise<TemplateResponse | RedirectResponse> {
    return new TemplateResponse('version.html', { 'appName': appName });
  }

}
