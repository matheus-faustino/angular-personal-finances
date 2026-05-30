import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule],
  template: `
    <ng-container *transloco="let t">
      <div class="space-y-6">
        <div>
          <h1 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            {{ t('dashboard.greeting', { name: auth.currentUser()?.name }) }}
          </h1>
          <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {{ t('dashboard.subtitle') }}
          </p>
        </div>

        <!-- Stat cards -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
            <p class="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
              {{ t('dashboard.monthlyIncome') }}
            </p>
            <p class="mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              R$ 0,00
            </p>
          </div>
          <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
            <p class="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
              {{ t('dashboard.monthlyExpenses') }}
            </p>
            <p class="mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              R$ 0,00
            </p>
          </div>
          <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
            <p class="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
              {{ t('dashboard.balance') }}
            </p>
            <p class="mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              R$ 0,00
            </p>
          </div>
        </div>
      </div>
    </ng-container>
  `,
})
export class DashboardComponent {
  protected readonly auth = inject(AuthService);
}
