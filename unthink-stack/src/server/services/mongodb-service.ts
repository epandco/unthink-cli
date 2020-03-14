import { injectable } from 'inversify';
import { MongoClient, Db } from 'mongodb';
import * as config from '../config/config';

import 'reflect-metadata';

@injectable()
export class MongoDbService {
  private client: MongoClient;
  private db: Db;

  constructor() {
    this.client = new MongoClient(
      config.mongoDbUrl,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    );
  }

  public async getDb(): Promise<Db> {
    if (!this.db) {
      console.log('Creating mongo db service');
      await this.client.connect();
      this.db = this.client.db(config.mongoDbDefaultDatabase);
    }

    return this.db;
  }
}