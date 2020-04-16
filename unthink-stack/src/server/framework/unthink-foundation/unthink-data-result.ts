import { UnthinkResult } from './unthink-result';


export class UnthinkDataResult extends UnthinkResult {
  // Used to ensure UnthinkViewResult can't be assigned to this class.
  private readonly __type: 'DATA_RESULT';

  constructor(
    status: number,
    value?: unknown,
    cookies?: unknown,
    headers?: Record<string, string>
  ) {
    super(status, value, cookies, headers);

    // dummy read to compile - see notes above
    this.__type;
  }

  public static ok(value?: unknown, cookies?: unknown, headers?: Record<string, string>): UnthinkDataResult {
    const status = value ? 200 : 204;
    return new UnthinkDataResult(status, value, cookies, headers);
  }

  public static error(value?: unknown, cookies?: unknown, headers?: Record<string, string>): UnthinkDataResult {
    return new UnthinkDataResult(400, value, cookies, headers);
  }

  public static notFound(cookies?: unknown, headers?: Record<string, string>): UnthinkDataResult {
    return new UnthinkDataResult(404, undefined, cookies, headers);
  }

  public static unauthorized(cookies?: unknown, headers?: Record<string, string>): UnthinkDataResult {
    return new UnthinkDataResult(401, undefined, cookies, headers);
  }
}
