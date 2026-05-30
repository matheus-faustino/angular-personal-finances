import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../core/services/auth.service';
import { TransactionService } from '../../core/services/transaction.service';
import { CategoryService } from '../../core/services/category.service';
import { TransactionResource } from '../../../api/models/transaction-resource';
import { TransactionFormComponent } from './transaction-form/transaction-form';

@Component({
  selector: 'app-transactions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, CurrencyPipe, TransactionFormComponent, TranslocoModule],
  template: `
    <ng-container *transloco="let t">
      <div class="space-y-6">

        <!-- Page header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{{ t('transactions.title') }}</h1>
            <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              @if (auth.isAdmin()) {
                {{ t('transactions.subtitleAdmin') }}
              } @else {
                {{ t('transactions.subtitleUser') }}
              }
            </p>
          </div>
          @if (!auth.isAdmin()) {
            <button
              type="button"
              (click)="openCreate()"
              class="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              {{ t('transactions.newTransaction') }}
            </button>
          }
        </div>

        <!-- Filter bar -->
        <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-5 py-4">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div class="flex flex-col gap-1.5">
              <label for="filter-start" class="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                {{ t('transactions.filterStartDate') }}
              </label>
              <input
                id="filter-start"
                type="date"
                [value]="filterStartDate()"
                (change)="filterStartDate.set($any($event.target).value)"
                class="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="filter-end" class="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                {{ t('transactions.filterEndDate') }}
              </label>
              <input
                id="filter-end"
                type="date"
                [value]="filterEndDate()"
                (change)="filterEndDate.set($any($event.target).value)"
                class="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="filter-category" class="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                {{ t('transactions.filterCategory') }}
              </label>
              <select
                id="filter-category"
                [value]="filterCategoryId() ?? ''"
                (change)="filterCategoryId.set($any($event.target).value ? +$any($event.target).value : null)"
                class="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
              >
                <option value="">{{ t('transactions.filterAll') }}</option>
                @for (cat of categoryService.categories(); track cat.id) {
                  <option [value]="cat.id">{{ cat.name }}</option>
                }
              </select>
            </div>
          </div>
          <div class="flex gap-2 mt-3">
            <button
              type="button"
              (click)="applyFilters()"
              class="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              {{ t('transactions.filterApply') }}
            </button>
            <button
              type="button"
              (click)="clearFilters()"
              class="rounded-lg border border-neutral-200 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              {{ t('transactions.filterClear') }}
            </button>
          </div>
        </div>

        <!-- Load error banner -->
        @if (transactionService.error()) {
          <div
            role="alert"
            class="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400"
          >
            {{ transactionService.error() }}
          </div>
        }

        <!-- Delete error banner -->
        @if (deleteError()) {
          <div
            role="alert"
            class="flex items-center justify-between rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400"
          >
            <span>{{ deleteError() }}</span>
            <button
              type="button"
              (click)="deleteError.set(null)"
              [attr.aria-label]="t('transactions.closeAlert')"
              class="ml-4 rounded p-0.5 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        }

        <!-- Loading skeleton -->
        @if (transactionService.loading()) {
          <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
            <div class="divide-y divide-neutral-100 dark:divide-neutral-800">
              @for (_ of skeletonRows; track $index) {
                <div class="px-6 py-4 flex gap-4">
                  <div class="h-4 w-40 rounded bg-neutral-100 dark:bg-neutral-800 animate-pulse"></div>
                  <div class="h-4 w-24 rounded bg-neutral-100 dark:bg-neutral-800 animate-pulse"></div>
                  <div class="h-4 w-20 rounded bg-neutral-100 dark:bg-neutral-800 animate-pulse"></div>
                  <div class="h-4 w-28 rounded bg-neutral-100 dark:bg-neutral-800 animate-pulse"></div>
                </div>
              }
            </div>
          </div>
        } @else {

          <!-- Empty state -->
          @if (transactionService.transactions().length === 0) {
            <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-6 py-12 text-center">
              <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ t('transactions.empty') }}</p>
              @if (!auth.isAdmin()) {
                <button
                  type="button"
                  (click)="openCreate()"
                  class="mt-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {{ t('transactions.createFirst') }}
                </button>
              }
            </div>
          } @else {

            <!-- Table -->
            <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
              <table class="w-full text-sm">
                <thead class="bg-neutral-50 dark:bg-neutral-800/50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                      {{ t('transactions.colName') }}
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide hidden sm:table-cell">
                      {{ t('transactions.colDescription') }}
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                      {{ t('transactions.colDate') }}
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide hidden md:table-cell">
                      {{ t('transactions.colCategory') }}
                    </th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                      {{ t('transactions.colValue') }}
                    </th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                      {{ t('transactions.colActions') }}
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800">
                  @for (tx of transactionService.transactions(); track tx.id) {
                    <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                      <td class="px-6 py-4 text-neutral-900 dark:text-neutral-100 font-medium">
                        {{ tx.name }}
                      </td>
                      <td class="px-6 py-4 text-neutral-500 dark:text-neutral-400 hidden sm:table-cell">
                        {{ tx.description ?? '—' }}
                      </td>
                      <td class="px-6 py-4 text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                        {{ tx.date | date:'dd/MM/yyyy' }}
                      </td>
                      <td class="px-6 py-4 text-neutral-500 dark:text-neutral-400 hidden md:table-cell">
                        {{ tx.category?.name ?? '—' }}
                      </td>
                      <td class="px-6 py-4 text-right text-neutral-900 dark:text-neutral-100 font-medium whitespace-nowrap">
                        {{ tx.value | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                      </td>
                      <td class="px-6 py-4 text-right">
                        @if (auth.isAdmin()) {
                          <button
                            type="button"
                            (click)="openDetail(tx)"
                            class="rounded px-2 py-1 text-xs font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                          >
                            {{ t('transactions.view') }}
                          </button>
                        } @else {
                          @if (pendingDeleteId() === tx.id) {
                            <div class="inline-flex items-center gap-2">
                              <span class="text-xs text-neutral-600 dark:text-neutral-400">{{ t('transactions.deleteConfirm') }}</span>
                              <button
                                type="button"
                                [disabled]="mutatingId() === tx.id"
                                (click)="confirmDelete(tx.id)"
                                class="rounded px-2 py-1 text-xs font-medium bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white transition-colors"
                              >
                                @if (mutatingId() === tx.id) { … } @else { {{ t('common.yes') }} }
                              </button>
                              <button
                                type="button"
                                (click)="pendingDeleteId.set(null)"
                                class="rounded px-2 py-1 text-xs font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                              >
                                {{ t('common.no') }}
                              </button>
                            </div>
                          } @else {
                            <div class="inline-flex items-center gap-2">
                              <button
                                type="button"
                                (click)="openEdit(tx)"
                                class="rounded px-2 py-1 text-xs font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                              >
                                {{ t('transactions.edit') }}
                              </button>
                              <button
                                type="button"
                                (click)="pendingDeleteId.set(tx.id)"
                                class="rounded px-2 py-1 text-xs font-medium border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                              >
                                {{ t('transactions.delete') }}
                              </button>
                            </div>
                          }
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }

        <!-- Transaction form/detail modal -->
        <app-transaction-form
          [open]="modalOpen()"
          [transaction]="editingTransaction()"
          [readonly]="detailMode()"
          (saved)="onSaved($event)"
          (cancelled)="closeModal()"
        />

      </div>
    </ng-container>
  `,
})
export class TransactionsComponent implements OnInit {
  private readonly route              = inject(ActivatedRoute);
  private readonly t                  = inject(TranslocoService);
  protected readonly auth               = inject(AuthService);
  protected readonly transactionService = inject(TransactionService);
  protected readonly categoryService    = inject(CategoryService);

  protected readonly filterStartDate  = signal<string>('');
  protected readonly filterEndDate    = signal<string>('');
  protected readonly filterCategoryId = signal<number | null>(null);
  private readonly filterDocumentId   = signal<number | null>(null);
  private readonly filterUserId       = signal<number | null>(null);

  protected readonly modalOpen          = signal<boolean>(false);
  protected readonly editingTransaction = signal<TransactionResource | null>(null);
  protected readonly detailMode         = signal<boolean>(false);

  protected readonly pendingDeleteId = signal<number | null>(null);
  protected readonly mutatingId      = signal<number | null>(null);
  protected readonly deleteError     = signal<string | null>(null);

  protected readonly skeletonRows = Array(5);

  ngOnInit(): void {
    this.categoryService.loadCategories();
    const docId = this.route.snapshot.queryParamMap.get('document_id');
    if (docId) this.filterDocumentId.set(+docId);
    const userId = this.route.snapshot.queryParamMap.get('user_id');
    if (userId) this.filterUserId.set(+userId);
    this.transactionService.loadTransactions({
      document_id: this.filterDocumentId(),
      user_id:     this.filterUserId(),
    });
  }

  protected applyFilters(): void {
    this.transactionService.loadTransactions({
      start_date:  this.filterStartDate()  || null,
      end_date:    this.filterEndDate()    || null,
      category_id: this.filterCategoryId(),
      document_id: this.filterDocumentId(),
      user_id:     this.filterUserId(),
    });
  }

  protected clearFilters(): void {
    this.filterStartDate.set('');
    this.filterEndDate.set('');
    this.filterCategoryId.set(null);
    this.filterDocumentId.set(null);
    this.filterUserId.set(null);
    this.transactionService.loadTransactions();
  }

  protected openCreate(): void {
    this.editingTransaction.set(null);
    this.detailMode.set(false);
    this.modalOpen.set(true);
  }

  protected openEdit(tx: TransactionResource): void {
    this.editingTransaction.set(tx);
    this.detailMode.set(false);
    this.modalOpen.set(true);
  }

  protected openDetail(tx: TransactionResource): void {
    this.editingTransaction.set(tx);
    this.detailMode.set(true);
    this.modalOpen.set(true);
  }

  protected closeModal(): void {
    this.modalOpen.set(false);
    this.editingTransaction.set(null);
    this.detailMode.set(false);
  }

  protected onSaved(_tx: TransactionResource): void {
    this.closeModal();
  }

  protected confirmDelete(id: number): void {
    this.mutatingId.set(id);
    this.deleteError.set(null);
    this.transactionService.remove(id).subscribe({
      next: () => {
        this.pendingDeleteId.set(null);
        this.mutatingId.set(null);
      },
      error: err => {
        this.mutatingId.set(null);
        this.pendingDeleteId.set(null);
        this.deleteError.set(err?.error?.message ?? this.t.translate('transactions.deleteError'));
      },
    });
  }
}
