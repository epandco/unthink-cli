import { ResourceBase } from './resource-base';
import { resource, get, template, TemplateResponse, RedirectResponse, ApiResponse, CookieResponse } from 'resource-decorator';

@resource({
  basePath: '',
})
export class HelloWorldResource extends ResourceBase {
  @template()
  async indexPage(): Promise<TemplateResponse | RedirectResponse> {
    return new TemplateResponse('hello-world.html');
  }

  @get({
    path: '/api/message'
  })
  async getMessage(): Promise<ApiResponse | CookieResponse | void> {
    return new ApiResponse({
      message: 'Hello, World'
    });
  }
}
