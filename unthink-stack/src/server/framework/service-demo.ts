import { ServiceResult } from './unthink-foundation/service-result';
import { TemplateResult } from './unthink-foundation/template-result';
import {  ResourceDefinition, data, view } from './unthink-foundation/resource-definition';
import { UnthinkExpressGenerator } from './unthink-foundation-express/unthink-express-generator';
import { UnthinkGenerator } from './unthink-foundation/unthink-generator';


/**
 * Create a service in this case just a plain class with a method that returns a service result, which is the only
 * requirement.
 */

interface User {
  id: number;
  name: string;
}

class UserService {
  private nextId: number = 4;
  private users: User[] = [
    { id: 1, name: 'Usr 1' },
    { id: 2, name: 'Usr 2' },
    { id: 3, name: 'Usr 3' }
  ]

  async getUsers(): Promise<ServiceResult<User[]>> {
    return ServiceResult.ok(this.users);
  }

  async getUser(id: number): Promise<ServiceResult<User>> {
    const user = this.users.find(p => p.id === id);

    if (!user) {
      return ServiceResult.notFound();
    }

    return ServiceResult.ok(user);
  }

  async createUser(model: { name: string }): Promise<ServiceResult<number>> {
    // update user
    this.users.push({
      id: this.nextId++,
      name: model.name
    });

    return ServiceResult.ok(this.nextId);
  }

  async updateUser(id: number, model: { name: string } ): Promise<ServiceResult> {
    const user = this.users.find(p => p.id === id);

    if (!user) {
      return ServiceResult.notFound();
    }

    // update user
    user.name = model.name;

    return ServiceResult.ok();
  }

  async deleteUser(id: number): Promise<ServiceResult> {
    const userIndex = this.users.findIndex(p => p.id === id);

    if (userIndex < 0) {
      return ServiceResult.notFound();
    }

    this.users.splice(userIndex, 1);

    return ServiceResult.ok();
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
        'GET': async () => {
          return TemplateResult.view('users.html');
        },
      },
    ),
    data(
      '/', // yields /api/users by default but can change via prefix parameter config
      { // ALL methods for this route are locked being data
        'GET': async (): Promise<ServiceResult> => {
          const us = new UserService();

          return us.getUsers();
        },
        'POST': { // <-- alternate form if you have middleware for this method
          handler: async (ctx): Promise<ServiceResult> => {
            const us = new UserService();
            return us.createUser(ctx.body as { name: string });
          },
          middleware: [
            // middleware only on the post of this route
          ]
        }
      },
      {
        // prefix: undefined, <-- to turn off prefix
        // prefix: /auth <--- to set another prefix
        middleware: [
          // could add middleware at route level so in this case all methods in this route would get middleware
          // even as the `/` route it's scoped to the data / view etc.
        ]
      }
    ),
    data(
      '/:id', // would yield /api/users/:id
      {
        'GET': async (ctx): Promise<ServiceResult> => {
          const us = new UserService();

          if (ctx.query) {
            return us.getUser(parseInt(ctx.query.id));
          }

          throw new Error('Query was undefined');
        },
        'PUT': async (ctx): Promise<ServiceResult> => {
          const us = new UserService();

          if (!ctx.path) {
            throw new Error('Query was undefined');
          }

          return us.updateUser(parseInt(ctx.path.id), ctx.body as { name: string });
        },
        'DELETE': async (ctx): Promise<ServiceResult> => {
          const us = new UserService();

          return us.deleteUser(parseInt(ctx.path?.id ?? ''));
        }
      }
    )
  ]
};

const gen = new UnthinkGenerator(new UnthinkExpressGenerator());

gen.add(userDef);
gen.generate();
