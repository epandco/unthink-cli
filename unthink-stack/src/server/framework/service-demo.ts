import { ServiceResult } from './service-result';
import { HandlerContext } from './resource-definition';
import { TemplateResult } from './template-result';
import { defineApiResource, defineTemplateResource, ResourceDefinition } from './resource-definition';


/**
 * Create a service in this case just a plain class with a method that returns a service result, which is the only
 * requirement.
 */
class TestService {
  async echo(inputStr: string): Promise<ServiceResult<number>> {
    const input = parseInt(inputStr);
    if (input > 200) {
      return ServiceResult.error({
        type: 'invalid range',
        message: 'Value must be below 201'
      });
    } else if (input > 100) {
      return ServiceResult.ok(input);
    } else {
      return ServiceResult.notFound();
    }
  }
}

const apiDef = defineApiResource({
  routes: {
    'test/service': {
      'GET': (ctx: HandlerContext): Promise<ServiceResult> => {
        const ts = new TestService();
        const result = ts.echo(ctx.query?.num ?? '');
        return result;
      },
    }
  }
});

const tempDef = defineTemplateResource({
  routes: {
    '/home': {
      // Virtually no need for a class here just can directly map request to a view
      'GET': async (_ctx: HandlerContext): Promise<TemplateResult> => {
        return TemplateResult.view('home');
      },
    },
    '/login': {
      // Virtually no need for a class here just can directly map request to a view
      'GET': async (_ctx: HandlerContext): Promise<TemplateResult> => {
        return TemplateResult.redirect('www.google.com');
      },
    }
  }
});

console.log(apiDef);
console.log(tempDef)

function print(resource: ResourceDefinition): void {
  switch (resource.kind) {
  case 'TEMPLATE':
    console.log('template alright');
    break;
  case 'API':
    for (const k in resource.routes) {
      const route = resource.routes[k];
      for (const m in route) {
        switch (m) {
        case 'GET':
          const f = route.GET;

          const ctx: HandlerContext = {
            query: {num: '124'}
          };

          if (!f) {
            continue;
          }

          f(ctx).then(r => {
            // Will print 124 in this case
            if (r.isOk) {
              console.log(r.value);
              return;
            }

            if (r.hasError) {
              console.log(r.error);
              return;
            }

            if (r.notFound) {
              console.log('not found!');
              return;
            }
          });
          break;
        default:
          throw Error('whoops!');
          break;
        }
      }
    }
    break;
}
}

print(apiDef);
print(tempDef);

