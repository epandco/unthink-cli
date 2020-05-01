import { ObjectId } from 'mongodb';

export abstract class BaseSchema {
  public _id?: ObjectId;
  public abstract type: string;
}