import { MongoClient, Collection, Db } from 'mongodb';
import * as config from '../config/config';

const client = new MongoClient(
  config.mongoDbUrl,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

let defaultDb: Db;

export function getClient(): MongoClient {
  return client;
}

export async function getDefaultDb(): Promise<Db> {
  if (!defaultDb) {
    console.log('Creating mongo db services');
    await client.connect();
    defaultDb = client.db(config.mongoDbDefaultDatabase);
  }

  return defaultDb;
}

export async function getDefaultCollection<CollectionSchema>(): Promise<Collection<CollectionSchema>> {
  const db = await getDefaultDb();
  return db.collection<CollectionSchema>(config.mongoDbDefaultCollection);
}