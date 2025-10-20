import { Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class ErrorMessageService {
  /**
   * Constructs a new instance of the ErrorMessagesService, injecting the dependencies.
   * @param i18n The i18n service used for translating error messages.
   */
  constructor(private readonly i18n: I18nService) {}

  /**
   * Retrieves the translated error message for the given key.
   * @param key The key of the error message to retrieve.
   * @param identifiers An optional object with identifiers to include in the translated string.
   * @returns The translated error message.
   */
  public getMsg(key: string, identifiers: object = {}): string {
    return this.i18n.t(`errors.${key}`, {
      lang: I18nContext.current().lang,
      ...(Object.keys(identifiers).length && {
        args: { ...identifiers },
      }),
    });
  }
}
