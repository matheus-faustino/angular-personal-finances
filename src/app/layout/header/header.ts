import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule],
  template: `
    <header class="sticky top-0 z-30 flex items-center gap-3 h-16 px-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
      <!-- Hamburger (mobile only) -->
      <button
        type="button"
        class="lg:hidden p-2 -ml-1 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
        (click)="sidebarToggle.emit()"
        [attr.aria-label]="'header.openMenu' | transloco"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      <!-- Page title slot -->
      <div class="flex-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
        <ng-content/>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2">

        <!-- Language selector -->
        <div class="relative">
          <label for="lang-select" class="sr-only">{{ 'header.language' | transloco }}</label>
          <select
            id="lang-select"
            [value]="language.lang()"
            (change)="onLangChange($any($event.target).value)"
            class="appearance-none rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2.5 py-1.5 pr-7 text-xs font-medium text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors"
          >
            <option value="en">EN</option>
            <option value="pt-BR">PT</option>
          </select>
          <svg
            class="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400"
            fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>

        <!-- Theme toggle -->
        <button
          type="button"
          (click)="theme.toggle()"
          class="p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 transition-colors"
          [attr.aria-label]="theme.isDark() ? ('header.enableLightTheme' | transloco) : ('header.enableDarkTheme' | transloco)"
          [attr.aria-pressed]="theme.isDark()"
        >
          @if (theme.isDark()) {
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/>
            </svg>
          } @else {
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            </svg>
          }
        </button>

        <!-- Logout -->
        <button
          type="button"
          (click)="logout()"
          class="p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 transition-colors"
          [attr.aria-label]="'header.logout' | transloco"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
        </button>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  readonly sidebarToggle = output<void>();

  protected readonly theme = inject(ThemeService);
  protected readonly language = inject(LanguageService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  onLangChange(lang: string): void {
    this.language.set(lang as 'en' | 'pt-BR');
  }

  logout(): void {
    this.auth.logout().subscribe({
      complete: () => this.router.navigate(['/login']),
    });
  }
}
