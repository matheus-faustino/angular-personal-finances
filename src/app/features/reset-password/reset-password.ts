import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ApiConfiguration } from '../../../api/api-configuration';
import { authResetPassword } from '../../../api/fn/reset-password/auth-reset-password';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmation = group.get('password_confirmation')?.value;
  return password === confirmation ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-reset-password',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <div class="w-full max-w-sm rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 shadow-sm">
        <div class="mb-6 flex flex-col items-center gap-2">
          <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center" aria-hidden="true">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
          </div>
          <h1 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Nova senha</h1>
        </div>

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
            <label for="password" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Nova senha
            </label>
            <div class="relative">
              <input
                id="password"
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="password"
                autocomplete="new-password"
                [attr.aria-describedby]="passwordError() ? 'password-error' : null"
                [attr.aria-invalid]="passwordError() ? 'true' : null"
                class="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 pr-10 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
              />
              <button
                type="button"
                (click)="showPassword.set(!showPassword())"
                [attr.aria-label]="showPassword() ? 'Ocultar senha' : 'Mostrar senha'"
                class="absolute inset-y-0 right-0 flex items-center px-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                @if (showPassword()) {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                } @else {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                }
              </button>
            </div>
            @if (passwordError()) {
              <p id="password-error" class="text-xs text-red-600 dark:text-red-400">{{ passwordError() }}</p>
            }
          </div>

          <div class="flex flex-col gap-1">
            <label for="password_confirmation" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Confirmar nova senha
            </label>
            <input
              id="password_confirmation"
              [type]="showPassword() ? 'text' : 'password'"
              formControlName="password_confirmation"
              autocomplete="new-password"
              [attr.aria-describedby]="confirmationError() ? 'confirmation-error' : null"
              [attr.aria-invalid]="confirmationError() ? 'true' : null"
              class="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="••••••••"
            />
            @if (confirmationError()) {
              <p id="confirmation-error" class="text-xs text-red-600 dark:text-red-400">{{ confirmationError() }}</p>
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
                Salvando…
              </span>
            } @else {
              Salvar nova senha
            }
          </button>

          <a
            routerLink="/login"
            class="text-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 rounded"
          >
            Voltar ao login
          </a>
        </form>
      </div>
    </div>
  `,
})
export class ResetPasswordComponent {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfiguration);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showPassword = signal(false);

  readonly form = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  passwordError(): string | null {
    const ctrl = this.form.controls.password;
    if (!ctrl.touched) return null;
    if (ctrl.hasError('required')) return 'Senha é obrigatória.';
    if (ctrl.hasError('minlength')) return 'A senha deve ter pelo menos 8 caracteres.';
    return null;
  }

  confirmationError(): string | null {
    const ctrl = this.form.controls.password_confirmation;
    if (!ctrl.touched) return null;
    if (ctrl.hasError('required')) return 'Confirmação de senha é obrigatória.';
    if (this.form.hasError('passwordsMismatch')) return 'As senhas não coincidem.';
    return null;
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading()) return;

    const params = this.route.snapshot.queryParamMap;
    const token = params.get('token') ?? '';
    const email = params.get('email') ?? '';

    if (!token || !email) {
      this.errorMessage.set('Link de recuperação inválido ou expirado.');
      return;
    }

    const { password, password_confirmation } = this.form.getRawValue();
    this.loading.set(true);
    this.errorMessage.set(null);

    authResetPassword(this.http, this.apiConfig.rootUrl, {
      body: { token, email, password: password!, password_confirmation: password_confirmation! },
    }).subscribe({
      next: () => this.router.navigate(['/login']),
      error: err => {
        this.loading.set(false);
        this.errorMessage.set(
          err?.error?.message ?? 'Erro ao redefinir a senha. O link pode ter expirado.',
        );
      },
    });
  }
}
