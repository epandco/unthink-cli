import * as fs from 'fs';
import { resource, template, TemplateResponse, RedirectResponse } from 'resource-decorator';
import { ResourceBase } from './resource-base';

@resource({ basePath: '/unthink/version' })
export class VersionResource extends ResourceBase {

  @template()
  async versionPage(): Promise<TemplateResponse | RedirectResponse> {
    const { name, version } = JSON.parse(fs.readFileSync('./package.json').toString());
    return new TemplateResponse('version.html', { name: name, version: version });
  }

}
