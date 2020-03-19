import { ServiceResult } from './service-result';
import { ServiceDefinition, HandlerContext, TemplateDefintion } from './service-definition';
import { TemplateResult } from './template-result';


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
    }
    else {
      return ServiceResult.notFound();
    }
  }
}

/**
 * Create service definition.
 * Definition is strongly type so compiler will complain if you get it wrong e.g for a given route the methods MUST be
 * GET / PUT / POST / DELETE or it's a compile error and the value of the method match the handler signature.
 */
const sd: ServiceDefinition = {
  'test/service': {
                                       /**
                                        * Using the type system we can say that the service result
                                        * must at least satisfy ServiceResult<unknown, ServiceError>
                                        * which echo return ServiceResult<number, ServiceError> and thus
                                        * passes the test.
                                        *
                                        * This trick allows us to not have to specify the generics
                                        * effectively casting the result to ServiceError<unknown, ServiceError>.
                                        *
                                        * Basically when wiring up the endpoint the result.value will be type unknown
                                        * which is ok a that point and only after the result is returned. Within this
                                        * function you will get full type safety and see that result.value is a number.
                                        *
                                        * So any user of the TestService is not losing any info, just the generated
                                        * express handler which doesn't need it.
                                        */
    'GET': (ctx: HandlerContext): Promise<ServiceResult> => {

      /**
       * For now requiring dev to new up the class we can use DI here and write some utility functions
       * but not sure I see a point to having the framework do this.
       */
      const ts = new TestService();

      /**
       * invoke what ever function is relevant and return result which MUST BE a Service result.
       */
      const result = ts.echo(ctx.query?.num ?? '');

      return result;
    },
  }
};

/****** For templates ******/

const td: TemplateDefintion = {
  '/home': {
    // Virtually no need for a class here just can directly map request to a view
    'GET': async (ctx: HandlerContext): Promise<TemplateResult> => {
      return TemplateResult.view('home');
    },
  },
  '/login': {
    // Virtually no need for a class here just can directly map request to a view
    'GET': async (ctx: HandlerContext): Promise<TemplateResult> => {
      return TemplateResult.redirect('www.google.com');
    },
  }
}

/**
 * This is a quick brain dump of looping through the service definition
 * as if I were wiring up the call express handlers.
 *
 * This would be buried deep in the register resource / service layer but wanted to ensure
 * it worked.
 */
for (const k in sd) {
  const route = sd[k];
  for (const m in sd[k]) {
    switch (m) {
      // can't index into the route due to it being Partial<Record<..., ...>>
      // I'm sure there is away around that but for now considering there are only four methods I don't care
      // that I'm doing a switch here... it works.
      case 'GET':
        const f = route.GET;

        const ctx: HandlerContext = {
          query: { num: '124' }
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

