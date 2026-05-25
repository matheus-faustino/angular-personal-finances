import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-transaction',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      <h1 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100 capitalize">transactions</h1>
      <p class="text-sm text-neutral-500 dark:text-neutral-400">Em construção.</p>
    </div>
  `,
})
export class TransactionsComponent {}
