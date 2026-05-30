import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { TransactionResource } from '../../../../api/models/transaction-resource';
import { CategoryResource } from '../../../../api/models/category-resource';
import { TransactionService } from '../../../core/services/transaction.service';
import { CategoryService } from '../../../core/services/category.service';


@Component({
  selector: 'app-transaction-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslocoModule],
  template: `
    <ng-container *transloco="let t">
      <dialog
        #dialogEl
        class="m-auto w-full max-w-lg rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-0 shadow-xl backdrop:bg-black/40 open:flex open:flex-col"
        (close)="onDialogClose()"
        aria-labelledby="tx-dialog-title"
      >
        <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2
            id="tx-dialog-title"
            class="text-base font-semibold text-neutral-900 dark:text-neutral-100"
          >
            @if (readonly()) {
              {{ t('transactions.form.titleDetail') }}
            } @else if (transaction()) {
              {{ t('transactions.form.titleEdit') }}
            } @else {
              {{ t('transactions.form.titleNew') }}
            }
          </h2>
          <button
            type="button"
            (click)="cancel()"
            [attr.aria-label]="t('transactions.form.close')"
            class="rounded-lg p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="px-6 py-4 flex flex-col gap-4 overflow-y-auto">

          @if (error()) {
            <div
              role="alert"
              class="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400"
            >
              {{ error() }}
            </div>
          }

          <!-- Name -->
          <div class="flex flex-col gap-1.5">
            <label for="tx-name" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {{ t('transactions.form.nameLabel') }}
            </label>
            <input
              id="tx-name"
              type="text"
              formControlName="name"
              [attr.aria-invalid]="nameError() ? 'true' : null"
              [attr.aria-describedby]="nameError() ? 'tx-name-error' : null"
              [placeholder]="t('transactions.form.namePlaceholder')"
              class="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
              [class.border-red-400]="nameError()"
              [class.dark:border-red-500]="nameError()"
            />
            @if (nameError()) {
              <p id="tx-name-error" class="text-xs text-red-600 dark:text-red-400">{{ nameError() }}</p>
            }
          </div>

          <!-- Description -->
          <div class="flex flex-col gap-1.5">
            <label for="tx-description" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {{ t('transactions.form.descriptionLabel') }}
              <span class="font-normal text-neutral-400">({{ t('transactions.form.descriptionOptional') }})</span>
            </label>
            <textarea
              id="tx-description"
              formControlName="description"
              rows="2"
              [placeholder]="t('transactions.form.descriptionPlaceholder')"
              class="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition resize-none disabled:opacity-60 disabled:cursor-not-allowed"
            ></textarea>
          </div>

          <!-- Date -->
          <div class="flex flex-col gap-1.5">
            <label for="tx-date" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {{ t('transactions.form.dateLabel') }}
            </label>
            <input
              id="tx-date"
              type="date"
              formControlName="date"
              [attr.aria-invalid]="dateError() ? 'true' : null"
              [attr.aria-describedby]="dateError() ? 'tx-date-error' : null"
              class="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
              [class.border-red-400]="dateError()"
              [class.dark:border-red-500]="dateError()"
            />
            @if (dateError()) {
              <p id="tx-date-error" class="text-xs text-red-600 dark:text-red-400">{{ dateError() }}</p>
            }
          </div>

          <!-- Value -->
          <div class="flex flex-col gap-1.5">
            <label for="tx-value" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {{ t('transactions.form.valueLabel') }}
            </label>
            <input
              id="tx-value"
              type="number"
              formControlName="value"
              step="0.01"
              min="0.01"
              [attr.aria-invalid]="valueError() ? 'true' : null"
              [attr.aria-describedby]="valueError() ? 'tx-value-error' : null"
              placeholder="0.00"
              class="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
              [class.border-red-400]="valueError()"
              [class.dark:border-red-500]="valueError()"
            />
            @if (valueError()) {
              <p id="tx-value-error" class="text-xs text-red-600 dark:text-red-400">{{ valueError() }}</p>
            }
          </div>

          <!-- Category -->
          <div class="flex flex-col gap-1.5">
            <label for="tx-category" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {{ t('transactions.form.categoryLabel') }}
            </label>
            <select
              id="tx-category"
              formControlName="category"
              [compareWith]="compareById"
              [attr.aria-invalid]="categoryError() ? 'true' : null"
              [attr.aria-describedby]="categoryError() ? 'tx-category-error' : null"
              class="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
              [class.border-red-400]="categoryError()"
              [class.dark:border-red-500]="categoryError()"
            >
              <option [ngValue]="null" disabled>{{ t('transactions.form.categoryPlaceholder') }}</option>
              @for (cat of categoryService.categories(); track cat.id) {
                <option [ngValue]="cat">{{ cat.name }}</option>
              }
            </select>
            @if (categoryError()) {
              <p id="tx-category-error" class="text-xs text-red-600 dark:text-red-400">{{ categoryError() }}</p>
            }
          </div>

          <!-- Footer -->
          <div class="flex justify-end gap-3 pt-1">
            <button
              type="button"
              (click)="cancel()"
              class="rounded-lg border border-neutral-200 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              @if (readonly()) { {{ t('transactions.form.close') }} } @else { {{ t('transactions.form.cancel') }} }
            </button>
            @if (!readonly()) {
              <button
                type="submit"
                [disabled]="loading()"
                [attr.aria-busy]="loading() ? 'true' : null"
                class="rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 px-4 py-2 text-sm font-medium text-white transition-colors"
              >
                @if (loading()) { {{ t('transactions.form.saving') }} } @else { {{ t('transactions.form.save') }} }
              </button>
            }
          </div>

        </form>
      </dialog>
    </ng-container>
  `,
})
export class TransactionFormComponent {
  readonly open        = input<boolean>(false);
  readonly transaction = input<TransactionResource | null>(null);
  readonly readonly    = input<boolean>(false);

  readonly saved     = output<TransactionResource>();
  readonly cancelled = output<void>();

  protected readonly categoryService    = inject(CategoryService);
  private readonly transactionService   = inject(TransactionService);
  private readonly fb                   = inject(FormBuilder);
  private readonly dialogRef            = viewChild<ElementRef<HTMLDialogElement>>('dialogEl');
  private readonly t                    = inject(TranslocoService);

  readonly loading = signal<boolean>(false);
  readonly error   = signal<string | null>(null);

  readonly form = this.fb.group({
    name:        ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    description: [null as string | null],
    date:        ['', [Validators.required]],
    value:       [null as number | null, [Validators.required, Validators.min(0.01)]],
    category:    [null as CategoryResource | null, [Validators.required]],
  });

  protected compareById(c1: CategoryResource | null, c2: CategoryResource | null): boolean {
    return c1?.id === c2?.id;
  }

  constructor() {
    effect(() => {
      const dialogEl = this.dialogRef()?.nativeElement;
      if (!dialogEl) return;

      if (this.open()) {
        const tx = this.transaction();
        this.error.set(null);

        if (tx) {
          this.form.reset({
            name:        tx.name,
            description: tx.description ?? null,
            date:        tx.date?.slice(0, 10) ?? '',
            value:       Number(tx.value),
            category:    tx.category ?? null,
          });
        } else {
          this.form.reset({ name: '', description: null, date: '', value: null, category: null });
        }

        if (this.readonly()) {
          this.form.disable();
        } else {
          this.form.enable();
        }

        dialogEl.showModal();
      } else {
        dialogEl.close();
      }
    });
  }

  nameError(): string | null {
    const ctrl = this.form.controls.name;
    if (!ctrl.touched) return null;
    if (ctrl.hasError('required')) return this.t.translate('validation.nameRequired');
    if (ctrl.hasError('minlength')) return this.t.translate('validation.nameMinLength2');
    if (ctrl.hasError('maxlength')) return this.t.translate('validation.nameMaxLength150');
    return null;
  }

  dateError(): string | null {
    const ctrl = this.form.controls.date;
    if (!ctrl.touched) return null;
    if (ctrl.hasError('required')) return this.t.translate('validation.dateRequired');
    return null;
  }

  valueError(): string | null {
    const ctrl = this.form.controls.value;
    if (!ctrl.touched) return null;
    if (ctrl.hasError('required')) return this.t.translate('validation.valueRequired');
    if (ctrl.hasError('min')) return this.t.translate('validation.valueMin');
    return null;
  }

  categoryError(): string | null {
    const ctrl = this.form.controls.category;
    if (!ctrl.touched) return null;
    if (ctrl.hasError('required')) return this.t.translate('validation.categoryRequired');
    return null;
  }

  cancel(): void {
    this.cancelled.emit();
  }

  onDialogClose(): void {
    this.cancelled.emit();
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading() || this.readonly()) return;

    const raw = this.form.getRawValue();
    const body = {
      name:        raw.name!.trim(),
      description: raw.description?.trim() || null,
      date:        raw.date!,
      value:       raw.value!,
      category_id: raw.category!.id,
    };

    const existing = this.transaction();
    this.loading.set(true);
    this.error.set(null);

    const op$ = existing
      ? this.transactionService.update(existing.id, body)
      : this.transactionService.create(body);

    op$.subscribe({
      next: saved => {
        this.loading.set(false);
        this.saved.emit(saved);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? this.t.translate('transactions.form.genericError'));
      },
    });
  }
}
