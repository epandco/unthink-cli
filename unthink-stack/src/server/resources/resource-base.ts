import { injectable, inject } from 'inversify';
import { TYPES } from '../config/di-types';
import { MongoDbService } from '../services/mongodb-service';
import { TYPES as RESOURCE_TYPES } from 'express-register-resource';
import { Logger } from 'pino';

@injectable()
export class ResourceBase {
  protected mongoDbService: MongoDbService;
  protected log: Logger;

  constructor(
    @inject(TYPES.MongoDbService) mongoDbService: MongoDbService,
    @inject(RESOURCE_TYPES.PinoLogger) log: Logger
  ) {
    this.mongoDbService = mongoDbService;
    this.log = log;
  }
}