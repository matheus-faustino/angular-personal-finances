import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localePtBR from '@angular/common/locales/pt';
import localeEn from '@angular/common/locales/en';
import { appConfig } from './app/app.config';
import { App } from './app/app';

registerLocaleData(localePtBR);
registerLocaleData(localeEn);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
