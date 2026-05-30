import {
  ApplicationConfig,
  provideAppInitializer,
  inject,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  LOCALE_ID,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideTransloco } from '@jsverse/transloco';
import { provideTranslocoLocale } from '@jsverse/transloco-locale';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AuthService } from './core/services/auth.service';
import { TranslocoHttpLoader } from './core/transloco/transloco-http.loader';

function getInitialLocale(): string {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('lang') : null;
  return stored === 'pt-BR' ? 'pt-BR' : 'en-US';
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useFactory: getInitialLocale },
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAppInitializer(() => inject(AuthService).init()),
    provideTransloco({
      config: {
        availableLangs: ['en', 'pt-BR'],
        defaultLang: 'en',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: false,
      },
      loader: TranslocoHttpLoader,
    }),
    provideTranslocoLocale({
      langToLocaleMapping: {
        'en': 'en-US',
        'pt-BR': 'pt-BR',
      },
    }),
  ],
};
