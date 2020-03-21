import { ServiceResult } from './service-result';
import { TemplateResult } from './template-result';
import {  ResourceDefinition, data, view } from './resource-definition';


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

const userDef: ResourceDefinition = {
  basePath: '/users',
  middleware: [
    // if we had middleware, this is optional just making an empty array to demonstrate it's here
  ],
  routes: [
    view(
      '/', // yields /users
      {
        'GET': async (): Promise<TemplateResult> => {
          return TemplateResult.view('users.html');
        },
      },
    ),
    data(
      '/', // yields /api/users by default but can change via prefix parameter on data
      {
        'GET': async (ctx) => {
          const ts = new TestService();

          if (ctx.query) {
            return ts.echo(ctx.query.num);
          }

          throw new Error('Query was undefined');
        }
      }
    )
  ]
};

console.log(userDef);

function print(resource: ResourceDefinition): void {
  console.log(resource.basePath);
  for (const k in resource.routes) {
    const route = resource.routes[k];

    for (const m in route) {
      switch (m) {
      case 'GET':
        const rh = route.GET;

        switch (rh.__routeType) {
        case 'VIEW':
          console.log('View Route');
          console.lo;
        }

        break;
      default:
        throw Error('whoops!');
        break;
      }
    }
  }
  break;
}

print(apiDef);
print(tempDef);

