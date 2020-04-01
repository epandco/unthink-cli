
enum TemplateResultState {
  VIEW,
  REDIRECT
}

export class TemplateResult<ValueModel = unknown> {

  private readonly state: TemplateResultState;

  public readonly templatePath?: string;
  public readonly templateModel?: ValueModel;
  public readonly redirectUrl?: string;

  public get isTemplate(): boolean {
    return this.state === TemplateResultState.VIEW;
  }

  public get isRedirect(): boolean {
    return this.state === TemplateResultState.REDIRECT;
  }

  private constructor(state: TemplateResultState, template?: string, redirectUrl?: string, value?: ValueModel) {
    this.templatePath = template;
    this.templateModel = value;
    this.redirectUrl = redirectUrl;
    this.state = state;
  }

  public static view<ValueModel>(template: string, value?: ValueModel): TemplateResult<ValueModel> {
    return new TemplateResult(TemplateResultState.VIEW, template, undefined, value);
  }

  public static redirect(url: string): TemplateResult {
    return new TemplateResult(TemplateResultState.REDIRECT, undefined, url, undefined);
  }
}
