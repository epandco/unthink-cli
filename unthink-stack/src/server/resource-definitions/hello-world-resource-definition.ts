import { data, ResourceDefinition, view } from '../framework/unthink-foundation/resource-definition';
import { ServiceResult } from '../framework/unthink-foundation/service-result';


const helloWorldDefinition: ResourceDefinition = {
  name: 'Hello World resource',
  routes: [
    view('/', 'hello-world.html'),
    data( '/message', {
      'get': async () => ServiceResult.ok({ message: 'Hello, World'})
    })
  ]
};

export default helloWorldDefinition;