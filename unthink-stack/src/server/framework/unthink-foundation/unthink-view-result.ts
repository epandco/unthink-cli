import { UnthinkResult } from './unthink-result';


export class UnthinkViewResult extends UnthinkResult {
  // Used to ensure that UnthinkDataResult can't be assigned to this class
  private readonly __type: 'VIEW_RESULT';

  public template?: string;
  public redirectUrl?: string;

  constructor(
    status: number,
    value?: unknown,
    cookies?: unknown,
    headers?: Record<string, string>,
    template?: string,
    redirectUrl?: string
  ) {
    super(status, value, cookies, headers);

    // Dummy read to compile
    this.__type;
    this.template = template;
    this.redirectUrl = redirectUrl;
  }

  public static ok(template: string, value?: unknown, cookies?: unknown, headers?: Record<string, string>): UnthinkViewResult {
    return new UnthinkViewResult(200, value, cookies, headers, template);
  }

  public static redirect(url: string, status: 301 | 302 = 302, cookies?: unknown, headers?: Record<string, string>): UnthinkViewResult {
    return new UnthinkViewResult(status,undefined, cookies, headers, undefined, url);
  }

  public static error(value?: unknown, template?: string,  cookies?: unknown, headers?: Record<string, string>): UnthinkViewResult {
    return new UnthinkViewResult(400, value, cookies, headers, template);
  }

  public static notFound(value?: unknown, template?: string, cookies?: unknown, headers?: Record<string, string>): UnthinkViewResult {
    return new UnthinkViewResult(404, value, cookies, headers, template);
  }

  public static unauthorized(value?: unknown, template?: string, cookies?: unknown, headers?: Record<string, string>): UnthinkViewResult {
    return new UnthinkViewResult(401, value, cookies, headers, template);
  }
}
