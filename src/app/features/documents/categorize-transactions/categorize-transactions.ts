import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionService } from '../../../core/services/transaction.service';
import { CategoryService } from '../../../core/services/category.service';
import { CategoryResource } from '../../../../api/models/category-resource';

@Component({
  selector: 'app-categorize-transactions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="space-y-6">

      <!-- Page header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Categorizar transações</h1>
          <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Atribua uma categoria a cada transação e salve em lote.
          </p>
        </div>
        <button
          type="button"
          (click)="cancel()"
          class="rounded-lg border border-neutral-200 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          Voltar
        </button>
      </div>

      <!-- Submit error banner -->
      @if (error()) {
        <div
          role="alert"
          class="flex items-center justify-between rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400"
        >
          <span>{{ error() }}</span>
          <button
            type="button"
            (click)="error.set(null)"
            aria-label="Fechar"
            class="ml-4 rounded p-0.5 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
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
            aria-label="Fechar"
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
        <div class="space-y-4">
          @for (_ of skeletonRows; track $index) {
            <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-6 py-4 flex gap-4">
              <div class="h-4 w-40 rounded bg-neutral-100 dark:bg-neutral-800 animate-pulse"></div>
              <div class="h-4 w-24 rounded bg-neutral-100 dark:bg-neutral-800 animate-pulse"></div>
              <div class="h-4 w-32 rounded bg-neutral-100 dark:bg-neutral-800 animate-pulse"></div>
            </div>
          }
        </div>
      } @else {

        <!-- Empty state -->
        @if (transactionService.transactions().length === 0) {
          <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-6 py-12 text-center">
            <p class="text-sm text-neutral-500 dark:text-neutral-400">Nenhuma transação encontrada para este documento.</p>
          </div>
        } @else {

          <!-- Transaction list form -->
          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <div formArrayName="rows" class="space-y-4">
              @for (row of rowGroups; track row.get('id')!.value; let i = $index) {
                <div
                  [formGroupName]="i"
                  class="rounded-xl border bg-white dark:bg-neutral-900 px-6 py-5 space-y-4 transition-all"
                  [class.border-neutral-200]="!isMissingCategory(row)"
                  [class.dark:border-neutral-800]="!isMissingCategory(row)"
                  [class.border-red-400]="isMissingCategory(row)"
                  [class.dark:border-red-600]="isMissingCategory(row)"
                  [class.ring-1]="isMissingCategory(row)"
                  [class.ring-red-400]="isMissingCategory(row)"
                  [class.dark:ring-red-600]="isMissingCategory(row)"
                >
                  <!-- Delete actions -->
                  <div class="flex justify-end">
                    @if (pendingDeleteId() === row.get('id')!.value) {
                      <div class="inline-flex items-center gap-2">
                        <span class="text-xs text-neutral-600 dark:text-neutral-400">Excluir?</span>
                        <button
                          type="button"
                          [disabled]="mutatingId() === row.get('id')!.value"
                          (click)="confirmDelete(row.get('id')!.value, i)"
                          class="rounded px-2 py-1 text-xs font-medium bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white transition-colors"
                        >
                          @if (mutatingId() === row.get('id')!.value) { … } @else { Sim }
                        </button>
                        <button
                          type="button"
                          (click)="pendingDeleteId.set(null)"
                          class="rounded px-2 py-1 text-xs font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                        >
                          Não
                        </button>
                      </div>
                    } @else {
                      <button
                        type="button"
                        (click)="pendingDeleteId.set(row.get('id')!.value)"
                        class="rounded px-2 py-1 text-xs font-medium border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                      >
                        Excluir
                      </button>
                    }
                  </div>

                  <!-- Row fields: name + date + value -->
                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <!-- Nome -->
                    <div class="flex flex-col gap-1.5">
                      <label
                        [for]="'row-' + i + '-name'"
                        class="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide"
                      >
                        Nome
                      </label>
                      <input
                        [id]="'row-' + i + '-name'"
                        type="text"
                        formControlName="name"
                        [attr.aria-invalid]="nameError(row) ? 'true' : null"
                        [attr.aria-describedby]="nameError(row) ? 'row-' + i + '-name-error' : null"
                        class="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                        [class.border-red-400]="nameError(row)"
                        [class.dark:border-red-500]="nameError(row)"
                      />
                      @if (nameError(row)) {
                        <p [id]="'row-' + i + '-name-error'" class="text-xs text-red-600 dark:text-red-400">{{ nameError(row) }}</p>
                      }
                    </div>

                    <!-- Data -->
                    <div class="flex flex-col gap-1.5">
                      <label
                        [for]="'row-' + i + '-date'"
                        class="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide"
                      >
                        Data
                      </label>
                      <input
                        [id]="'row-' + i + '-date'"
                        type="date"
                        formControlName="date"
                        [attr.aria-invalid]="dateError(row) ? 'true' : null"
                        [attr.aria-describedby]="dateError(row) ? 'row-' + i + '-date-error' : null"
                        class="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                        [class.border-red-400]="dateError(row)"
                        [class.dark:border-red-500]="dateError(row)"
                      />
                      @if (dateError(row)) {
                        <p [id]="'row-' + i + '-date-error'" class="text-xs text-red-600 dark:text-red-400">{{ dateError(row) }}</p>
                      }
                    </div>

                    <!-- Valor -->
                    <div class="flex flex-col gap-1.5">
                      <label
                        [for]="'row-' + i + '-value'"
                        class="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide"
                      >
                        Valor (R$)
                      </label>
                      <input
                        [id]="'row-' + i + '-value'"
                        type="number"
                        formControlName="value"
                        step="0.01"
                        min="0.01"
                        [attr.aria-invalid]="valueError(row) ? 'true' : null"
                        [attr.aria-describedby]="valueError(row) ? 'row-' + i + '-value-error' : null"
                        class="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                        [class.border-red-400]="valueError(row)"
                        [class.dark:border-red-500]="valueError(row)"
                      />
                      @if (valueError(row)) {
                        <p [id]="'row-' + i + '-value-error'" class="text-xs text-red-600 dark:text-red-400">{{ valueError(row) }}</p>
                      }
                    </div>
                  </div>

                  <!-- Descrição + Categoria -->
                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <!-- Descrição -->
                    <div class="flex flex-col gap-1.5">
                      <label
                        [for]="'row-' + i + '-description'"
                        class="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide"
                      >
                        Descrição <span class="normal-case font-normal text-neutral-400">(opcional)</span>
                      </label>
                      <input
                        [id]="'row-' + i + '-description'"
                        type="text"
                        formControlName="description"
                        class="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                      />
                    </div>

                    <!-- Categoria -->
                    <div class="flex flex-col gap-1.5">
                      <label
                        [for]="'row-' + i + '-category'"
                        class="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide"
                      >
                        Categoria
                      </label>
                      <select
                        [id]="'row-' + i + '-category'"
                        formControlName="category"
                        [compareWith]="compareById"
                        [attr.aria-invalid]="categoryError(row) ? 'true' : null"
                        [attr.aria-describedby]="categoryError(row) ? 'row-' + i + '-category-error' : null"
                        class="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                        [class.border-red-400]="categoryError(row)"
                        [class.dark:border-red-500]="categoryError(row)"
                      >
                        <option [ngValue]="null" disabled>Selecione uma categoria</option>
                        @for (cat of categoryService.categories(); track cat.id) {
                          <option [ngValue]="cat">{{ cat.name }}</option>
                        }
                      </select>
                      @if (categoryError(row)) {
                        <p [id]="'row-' + i + '-category-error'" class="text-xs text-red-600 dark:text-red-400">{{ categoryError(row) }}</p>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Footer -->
            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                (click)="cancel()"
                class="rounded-lg border border-neutral-200 dark:border-neutral-700 px-5 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="loading()"
                [attr.aria-busy]="loading() ? 'true' : null"
                class="rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 px-5 py-2.5 text-sm font-medium text-white transition-colors"
              >
                @if (loading()) { Salvando… } @else { Salvar }
              </button>
            </div>
          </form>
        }
      }

    </div>
  `,
})
export class CategorizeTransactionsComponent implements OnInit {
  protected readonly transactionService = inject(TransactionService);
  protected readonly categoryService    = inject(CategoryService);
  private readonly route                = inject(ActivatedRoute);
  private readonly router               = inject(Router);
  private readonly fb                   = inject(FormBuilder);

  protected readonly loading         = signal<boolean>(false);
  protected readonly error           = signal<string | null>(null);
  protected readonly deleteError     = signal<string | null>(null);
  protected readonly pendingDeleteId = signal<number | null>(null);
  protected readonly mutatingId      = signal<number | null>(null);

  protected readonly skeletonRows = Array(4);

  protected readonly form = this.fb.group({
    rows: this.fb.array<FormGroup>([]),
  });

  private get rowsArray() {
    return this.form.controls.rows;
  }

  get rowGroups(): FormGroup[] {
    return this.rowsArray.controls as FormGroup[];
  }

  private readonly documentId  = Number(this.route.snapshot.paramMap.get('id'));
  private isInitialized = false;

  constructor() {
    effect(() => {
      const transactions = this.transactionService.transactions();
      if (this.transactionService.loading()) return;
      if (this.isInitialized) return;

      this.rowsArray.clear({ emitEvent: false });
      for (const tx of transactions) {
        this.rowsArray.push(
          this.fb.group({
            id:          [tx.id],
            name:        [tx.name, [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
            description: [tx.description ?? null],
            date:        [tx.date?.slice(0, 10) ?? '', [Validators.required]],
            value:       [Number(tx.value), [Validators.required, Validators.min(0.01)]],
            category:    [tx.category ?? null, [Validators.required]],
          }),
          { emitEvent: false },
        );
      }
      this.isInitialized = true;
    });
  }

  ngOnInit(): void {
    this.categoryService.loadCategories();
    this.transactionService.loadByDocument(this.documentId);
  }

  protected compareById(c1: CategoryResource | null, c2: CategoryResource | null): boolean {
    return c1?.id === c2?.id;
  }

  protected isMissingCategory(row: FormGroup): boolean {
    return row.controls['category'].value == null;
  }

  protected nameError(row: FormGroup): string | null {
    const ctrl = row.controls['name'];
    if (!ctrl.touched) return null;
    if (ctrl.hasError('required'))   return 'Nome é obrigatório.';
    if (ctrl.hasError('minlength'))  return 'Nome deve ter ao menos 2 caracteres.';
    if (ctrl.hasError('maxlength'))  return 'Nome deve ter no máximo 150 caracteres.';
    return null;
  }

  protected dateError(row: FormGroup): string | null {
    const ctrl = row.controls['date'];
    if (!ctrl.touched) return null;
    if (ctrl.hasError('required')) return 'Data é obrigatória.';
    return null;
  }

  protected valueError(row: FormGroup): string | null {
    const ctrl = row.controls['value'];
    if (!ctrl.touched) return null;
    if (ctrl.hasError('required')) return 'Valor é obrigatório.';
    if (ctrl.hasError('min'))      return 'Valor deve ser maior que zero.';
    return null;
  }

  protected categoryError(row: FormGroup): string | null {
    const ctrl = row.controls['category'];
    if (!ctrl.touched) return null;
    if (ctrl.hasError('required')) return 'Categoria é obrigatória.';
    return null;
  }

  protected confirmDelete(id: number, index: number): void {
    this.mutatingId.set(id);
    this.deleteError.set(null);
    this.transactionService.remove(id).subscribe({
      next: () => {
        this.rowsArray.removeAt(index);
        this.pendingDeleteId.set(null);
        this.mutatingId.set(null);
      },
      error: err => {
        this.mutatingId.set(null);
        this.pendingDeleteId.set(null);
        this.deleteError.set(err?.error?.message ?? 'Erro ao excluir transação. Tente novamente.');
      },
    });
  }

  protected cancel(): void {
    this.router.navigate(['/documents']);
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading()) return;

    const rows = this.rowsArray.getRawValue().map((r: any) => ({
      id:          r.id as number,
      name:        (r.name as string).trim(),
      description: (r.description as string | null)?.trim() || null,
      date:        r.date as string,
      value:       r.value as number,
      category_id: (r.category as CategoryResource).id,
    }));

    this.loading.set(true);
    this.error.set(null);

    this.transactionService.bulkUpdate(rows).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/documents', {
          state: { flash: 'Transações categorizadas com sucesso.' },
        });
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Erro ao salvar as transações. Tente novamente.');
      },
    });
  }
}
