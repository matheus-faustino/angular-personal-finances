import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Olá, {{ auth.currentUser()?.name }} 👋
        </h1>
        <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Bem-vindo ao painel de controle.
        </p>
      </div>

      <!-- Stat cards -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        @for (card of cards; track card.label) {
          <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
            <p class="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
              {{ card.label }}
            </p>
            <p class="mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              {{ card.value }}
            </p>
          </div>
        }
      </div>
    </div>
  `,
})
export class DashboardComponent {
  protected readonly auth = inject(AuthService);

  protected readonly cards = [
    { label: 'Receitas do mês', value: 'R$ 0,00' },
    { label: 'Despesas do mês', value: 'R$ 0,00' },
    { label: 'Saldo', value: 'R$ 0,00' },
  ];
}
