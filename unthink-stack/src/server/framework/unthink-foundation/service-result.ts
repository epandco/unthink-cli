import { ServiceError } from './service-error';


enum ServiceResultState {
  OK,
  ERROR,
  NOT_FOUND
}

export class ServiceResult<ValueModel = unknown, ErrorModel = ServiceError> {

  private readonly state: ServiceResultState;

  public value?: ValueModel;
  public error?: ErrorModel;

  public get isOk(): boolean {
    return this.state === ServiceResultState.OK;
  }

  public get hasError(): boolean {
    return this.state === ServiceResultState.ERROR;
  }

  public get notFound(): boolean {
    return this.state === ServiceResultState.NOT_FOUND;
  }

  private constructor(state: ServiceResultState, value?: ValueModel, error?: ErrorModel) {
    // If neither are set then not found
    if (value && error) {
      throw new Error('Both value and error should not be set!');
    }

    this.state = state;
    this.value = value;
    this.error = error;
  }

  public static ok<ValueModel, ErrorModel = ServiceError>(value?: ValueModel): ServiceResult<ValueModel, ErrorModel> {
    return new ServiceResult<ValueModel, ErrorModel>(ServiceResultState.OK, value);
  }

  public static error<ValueModel = never, ErrorModel = ServiceError>(error: ErrorModel): ServiceResult<ValueModel, ErrorModel> {
    return new ServiceResult<ValueModel, ErrorModel>(ServiceResultState.ERROR,undefined, error);
  }

  public static notFound<ValueModel = never, ErrorModel = ServiceError>(): ServiceResult<ValueModel, ErrorModel> {
    return new ServiceResult<ValueModel, ErrorModel>(ServiceResultState.NOT_FOUND);
  }
}
