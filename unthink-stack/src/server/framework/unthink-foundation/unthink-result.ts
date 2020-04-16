
export class UnthinkResult {
  protected constructor(
    public readonly status: number,
    public readonly value?: unknown,
    public readonly cookies?: unknown,
    public readonly headers?: Record<string, string>
  ) {}
}
