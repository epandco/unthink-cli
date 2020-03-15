import { Container } from 'inversify';
import { TYPES } from './di-types';
import { MongoDbService } from '../services/mongodb-service';

import 'reflect-metadata';

const defaultContainer = new Container();

// Bind all of services
defaultContainer.bind<MongoDbService>(TYPES.MongoDbService).to(MongoDbService).inSingletonScope();

export { defaultContainer };