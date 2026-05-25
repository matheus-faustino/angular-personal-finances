import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <div class="w-full max-w-sm rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 shadow-sm">
        <div class="mb-6 flex flex-col items-center gap-2">
          <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
          </div>
          <h1 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Finanças Pessoais</h1>
        </div>

        <p class="text-center text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          Acesso rápido (demo)
        </p>

        <div class="flex flex-col gap-3">
          <button
            type="button"
            (click)="loginAs('admin')"
            class="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 transition-colors"
          >
            Entrar como Administrador
          </button>
          <button
            type="button"
            (click)="loginAs('user')"
            class="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 px-4 py-2.5 text-sm font-medium text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 transition-colors"
          >
            Entrar como Usuário
          </button>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  loginAs(role: 'admin' | 'user'): void {
    this.auth.setUser({
      id: 1,
      name: role === 'admin' ? 'Admin Demo' : 'Usuário Demo',
      email: role === 'admin' ? 'admin@demo.com' : 'user@demo.com',
      role,
      created_at: null,
      updated_at: null,
      email_verified_at: null,
    });
    this.router.navigate(['/dashboard']);
  }
}
