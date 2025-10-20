import { Module, Global } from '@nestjs/common';
import * as path from 'path';
import {
  I18nModule,
  AcceptLanguageResolver,
  QueryResolver,
  HeaderResolver,
} from 'nestjs-i18n';

import * as Services from '@infra/i18n/services';

const services = Object.values(Services);

@Global()
@Module({
  imports: [
    I18nModule.forRootAsync({
      useFactory: () => ({
        fallbackLanguage: 'es',
        loaderOptions: {
          path: path.join(__dirname, '../internal/infra/i18n/locales/'),
          watch: true,
        },
      }),
      resolvers: [
        new QueryResolver(['lang', 'l']),
        new HeaderResolver(['x-user-lang']),
        AcceptLanguageResolver,
      ],
    }),
  ],
  providers: [...services],
  exports: [...services],
})
export class GlobalSharedModule {}
