import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  output,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryResource } from '../../../../api/models/category-resource';
import { CategoryService } from '../../../core/services/category.service';

@Component({
  selector: 'app-category-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <dialog
      #dialogEl
      class="m-auto w-full max-w-md rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-0 shadow-xl backdrop:bg-black/40 open:flex open:flex-col"
      (close)="onDialogClose()"
      aria-labelledby="dialog-title"
    >
      <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
        <h2
          id="dialog-title"
          class="text-base font-semibold text-neutral-900 dark:text-neutral-100"
        >
          @if (category()) { Editar categoria } @else { Nova categoria }
        </h2>
        <button
          type="button"
          (click)="cancel()"
          aria-label="Fechar"
          class="rounded-lg p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="px-6 py-4 flex flex-col gap-4">

        @if (error()) {
          <div
            role="alert"
            class="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400"
          >
            {{ error() }}
          </div>
        }

        <div class="flex flex-col gap-1.5">
          <label
            for="cat-name"
            class="text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Nome
          </label>
          <input
            id="cat-name"
            type="text"
            formControlName="name"
            [attr.aria-invalid]="nameError() ? 'true' : null"
            [attr.aria-describedby]="nameError() ? 'name-error' : null"
            placeholder="Ex: Alimentação"
            class="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
            [class.border-red-400]="nameError()"
            [class.dark:border-red-500]="nameError()"
          />
          @if (nameError()) {
            <p id="name-error" class="text-xs text-red-600 dark:text-red-400">{{ nameError() }}</p>
          }
        </div>

        <div class="flex justify-end gap-3 pt-1">
          <button
            type="button"
            (click)="cancel()"
            class="rounded-lg border border-neutral-200 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            [disabled]="loading()"
            [attr.aria-busy]="loading() ? 'true' : null"
            class="rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            @if (loading()) { Salvando… } @else { Salvar }
          </button>
        </div>
      </form>
    </dialog>
  `,
})
export class CategoryFormComponent {
  readonly open = input<boolean>(false);
  readonly category = input<CategoryResource | null>(null);

  readonly saved = output<CategoryResource>();
  readonly cancelled = output<void>();

  private readonly categoryService = inject(CategoryService);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = viewChild<ElementRef<HTMLDialogElement>>('dialogEl');

  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
  });

  constructor() {
    effect(() => {
      const dialogEl = this.dialogRef()?.nativeElement;
      if (!dialogEl) return;

      if (this.open()) {
        const cat = this.category();
        this.form.reset({ name: cat?.name ?? '' });
        this.error.set(null);
        dialogEl.showModal();
      } else {
        dialogEl.close();
      }
    });
  }

  nameError(): string | null {
    const ctrl = this.form.controls.name;
    if (!ctrl.touched) return null;
    if (ctrl.hasError('required')) return 'Nome é obrigatório.';
    if (ctrl.hasError('minlength')) return 'Nome deve ter ao menos 2 caracteres.';
    if (ctrl.hasError('maxlength')) return 'Nome deve ter no máximo 100 caracteres.';
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
    if (this.form.invalid || this.loading()) return;

    const name = this.form.getRawValue().name!.trim();
    const existingCategory = this.category();
    this.loading.set(true);
    this.error.set(null);

    const operation$ = existingCategory
      ? this.categoryService.update(existingCategory.id, name)
      : this.categoryService.create(name);

    operation$.subscribe({
      next: saved => {
        this.loading.set(false);
        this.saved.emit(saved);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Ocorreu um erro. Tente novamente.');
      },
    });
  }
}
