import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ApiConfiguration } from '../../../api/api-configuration';
import { authForgotPassword } from '../../../api/fn/reset-password/auth-forgot-password';

@Component({
  selector: 'app-forgot-password',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, TranslocoModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <div class="w-full max-w-sm rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 shadow-sm">
        <div class="mb-6 flex flex-col items-center gap-2">
          <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center" aria-hidden="true">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
          </div>
          <h1 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{{ 'auth.forgotPassword.title' | transloco }}</h1>
        </div>

        @if (success()) {
          <div
            role="status"
            class="flex flex-col items-center gap-4 text-center"
          >
            <div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <p class="text-sm text-neutral-700 dark:text-neutral-300">
              {{ 'auth.forgotPassword.successMessage' | transloco }}
            </p>
            <a
              routerLink="/login"
              class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 rounded"
            >
              {{ 'auth.forgotPassword.backToLogin' | transloco }}
            </a>
          </div>
        } @else {
          <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-6 text-center">
            {{ 'auth.forgotPassword.subtitle' | transloco }}
          </p>

          <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="flex flex-col gap-4">
            @if (errorMessage()) {
              <div
                role="alert"
                class="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 px-3 py-2 text-sm text-red-700 dark:text-red-300"
              >
                {{ errorMessage() }}
              </div>
            }

            <div class="flex flex-col gap-1">
              <label for="email" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {{ 'auth.forgotPassword.emailLabel' | transloco }}
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                autocomplete="email"
                [attr.aria-describedby]="emailError() ? 'email-error' : null"
                [attr.aria-invalid]="emailError() ? 'true' : null"
                [placeholder]="'auth.forgotPassword.emailPlaceholder' | transloco"
                class="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              @if (emailError()) {
                <p id="email-error" class="text-xs text-red-600 dark:text-red-400">{{ emailError() }}</p>
              }
            </div>

            <button
              type="submit"
              [disabled]="loading()"
              [attr.aria-busy]="loading()"
              class="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              @if (loading()) {
                <span class="flex items-center justify-center gap-2">
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  {{ 'auth.forgotPassword.sending' | transloco }}
                </span>
              } @else {
                {{ 'auth.forgotPassword.sendInstructions' | transloco }}
              }
            </button>

            <a
              routerLink="/login"
              class="text-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 rounded"
            >
              {{ 'auth.forgotPassword.backToLogin' | transloco }}
            </a>
          </form>
        }
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfiguration);
  private readonly fb = inject(FormBuilder);
  private readonly t = inject(TranslocoService);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly success = signal(false);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  emailError(): string | null {
    const ctrl = this.form.controls.email;
    if (!ctrl.touched) return null;
    if (ctrl.hasError('required')) return this.t.translate('validation.emailRequired');
    if (ctrl.hasError('email')) return this.t.translate('validation.emailInvalid');
    return null;
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading()) return;

    const email = this.form.getRawValue().email!;
    this.loading.set(true);
    this.errorMessage.set(null);

    authForgotPassword(this.http, this.apiConfig.rootUrl, { body: { email } }).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: err => {
        this.loading.set(false);
        this.errorMessage.set(
          err?.error?.message ?? this.t.translate('auth.forgotPassword.genericError'),
        );
      },
    });
  }
}
