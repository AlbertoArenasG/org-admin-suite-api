import { Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class SuccessMessagesService {
  /**
   * Constructs a new instance of the SuccessMessagesService, injecting the dependencies.
   * @param i18n The i18n service used for translating success messages.
   */
  constructor(private readonly i18n: I18nService) {}

  /**
   * Retrieves the translated success message for the given key.
   * @param key The key of the success message to retrieve.
   * @param identifiers An optional object with identifiers to include in the translated string.
   * @returns The translated success message.
   */
  public getMsg(key: string, identifiers: object = {}): string {
    return this.i18n.t(`success.${key}`, {
      lang: I18nContext.current().lang,
      ...(Object.keys(identifiers).length && {
        args: { ...identifiers },
      }),
    });
  }
}
