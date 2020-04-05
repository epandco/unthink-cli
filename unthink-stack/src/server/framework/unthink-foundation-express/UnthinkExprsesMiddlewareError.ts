export class UnthinkExpressMiddlewareError {
  constructor(
    public status: number,
    public value?: unknown
  ) {}
}