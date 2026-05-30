import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslocoService } from '@jsverse/transloco';

export type Lang = 'en' | 'pt-BR';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly translocoService = inject(TranslocoService);
  private readonly storageKey = 'lang';

  readonly lang = signal<Lang>(this.getInitialLang());

  constructor() {
    effect(() => {
      const lang = this.lang();
      this.translocoService.setActiveLang(lang);
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.storageKey, lang);
        document.documentElement.setAttribute('lang', lang);
      }
    });
  }

  set(lang: Lang): void {
    this.lang.set(lang);
  }

  toggle(): void {
    this.lang.update(l => (l === 'en' ? 'pt-BR' : 'en'));
  }

  private getInitialLang(): Lang {
    if (!isPlatformBrowser(this.platformId)) return 'en';
    const stored = localStorage.getItem(this.storageKey) as Lang | null;
    if (stored === 'en' || stored === 'pt-BR') return stored;
    return 'en';
  }
}
