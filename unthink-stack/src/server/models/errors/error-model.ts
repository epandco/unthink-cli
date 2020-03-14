import { ResourceError } from 'resource-decorator';

export class ErrorModel extends ResourceError {
  public type: string;

  constructor(type: string, msg: string) {
    super(msg);
    this.type = type;
  }
}