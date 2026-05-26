import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DocumentResource } from '../../../../api/models/document-resource';
import { DocumentStatus } from '../../../../api/models/document-status';
import { DocumentService } from '../../../core/services/document.service';

@Component({
  selector: 'app-document-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DatePipe],
  template: `
    <dialog
      #dialogEl
      class="m-auto w-full max-w-lg rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-0 shadow-xl backdrop:bg-black/40 open:flex open:flex-col"
      (close)="onDialogClose()"
      aria-labelledby="doc-dialog-title"
    >
      <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
        <h2
          id="doc-dialog-title"
          class="text-base font-semibold text-neutral-900 dark:text-neutral-100"
        >
          @if (readonly()) {
            Detalhes do documento
          } @else if (document()) {
            Editar documento
          } @else {
            Novo documento
          }
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

      @if (readonly()) {
        <!-- Detail / readonly view -->
        <div class="px-6 py-5 flex flex-col gap-4">
          <div class="flex flex-col gap-1">
            <span class="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Nome</span>
            <span class="text-sm text-neutral-900 dark:text-neutral-100">{{ document()?.name }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Descrição</span>
            <span class="text-sm text-neutral-500 dark:text-neutral-400">{{ document()?.description ?? '—' }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Status</span>
            <span class="inline-flex w-fit">
              <span [class]="statusBadgeClass(document()?.status)">{{ statusLabel(document()?.status) }}</span>
            </span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Criado em</span>
            <span class="text-sm text-neutral-500 dark:text-neutral-400">{{ document()?.created_at | date:'dd/MM/yyyy' }}</span>
          </div>
          <div class="flex justify-end pt-1">
            <button
              type="button"
              (click)="cancel()"
              class="rounded-lg border border-neutral-200 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      } @else {
        <!-- Create / edit form -->
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="px-6 py-5 flex flex-col gap-4">

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
            <label for="doc-name" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Nome <span aria-hidden="true" class="text-red-500">*</span>
            </label>
            <input
              id="doc-name"
              type="text"
              formControlName="name"
              placeholder="Ex: Contrato de prestação de serviços"
              [attr.aria-invalid]="nameError() ? 'true' : null"
              [attr.aria-describedby]="nameError() ? 'doc-name-error' : null"
              class="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
              [class.border-red-400]="nameError()"
              [class.dark:border-red-500]="nameError()"
            />
            @if (nameError()) {
              <p id="doc-name-error" class="text-xs text-red-600 dark:text-red-400">{{ nameError() }}</p>
            }
          </div>

          <!-- Description -->
          <div class="flex flex-col gap-1.5">
            <label for="doc-description" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Descrição
            </label>
            <textarea
              id="doc-description"
              formControlName="description"
              rows="3"
              placeholder="Descrição opcional do documento"
              class="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition resize-none"
            ></textarea>
          </div>

          <!-- File -->
          <div class="flex flex-col gap-1.5">
            <label for="doc-file" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Arquivo @if (!document()) { <span aria-hidden="true" class="text-red-500">*</span> }
            </label>
            @if (document() && !selectedFile()) {
              <p class="text-xs text-neutral-500 dark:text-neutral-400">
                Arquivo atual: <span class="font-medium">{{ document()?.name }}</span>. Selecione um novo arquivo para substituir.
              </p>
            }
            <input
              id="doc-file"
              type="file"
              (change)="onFileChange($event)"
              [attr.aria-invalid]="fileError() ? 'true' : null"
              [attr.aria-describedby]="fileError() ? 'doc-file-error' : null"
              class="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 file:mr-3 file:rounded file:border-0 file:bg-neutral-100 dark:file:bg-neutral-700 file:px-3 file:py-1 file:text-xs file:font-medium file:text-neutral-700 dark:file:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
              [class.border-red-400]="fileError()"
              [class.dark:border-red-500]="fileError()"
            />
            @if (selectedFile()) {
              <p class="text-xs text-neutral-500 dark:text-neutral-400">
                Selecionado: <span class="font-medium">{{ selectedFile()!.name }}</span>
              </p>
            }
            @if (fileError()) {
              <p id="doc-file-error" class="text-xs text-red-600 dark:text-red-400">{{ fileError() }}</p>
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
      }
    </dialog>
  `,
})
export class DocumentFormComponent {
  readonly open = input<boolean>(false);
  readonly document = input<DocumentResource | null>(null);
  readonly readonly = input<boolean>(false);

  readonly saved = output<DocumentResource>();
  readonly cancelled = output<void>();

  private readonly documentService = inject(DocumentService);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = viewChild<ElementRef<HTMLDialogElement>>('dialogEl');

  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly selectedFile = signal<File | null>(null);
  readonly fileError = signal<string | null>(null);
  readonly fileTouched = signal<boolean>(false);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    description: [null as string | null],
  });

  constructor() {
    effect(() => {
      const dialogEl = this.dialogRef()?.nativeElement;
      if (!dialogEl) return;

      if (this.open()) {
        const doc = this.document();
        this.form.reset({
          name: doc?.name ?? '',
          description: doc?.description ?? null,
        });
        this.error.set(null);
        this.selectedFile.set(null);
        this.fileError.set(null);
        this.fileTouched.set(false);
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
    if (ctrl.hasError('maxlength')) return 'Nome deve ter no máximo 150 caracteres.';
    return null;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFile.set(file);
    this.fileTouched.set(true);
    this.fileError.set(null);
  }

  statusLabel(status: DocumentStatus | null | undefined): string {
    switch (status) {
      case 'processing': return 'Processando';
      case 'processed':  return 'Processado';
      case 'failed':     return 'Falhou';
      default:           return 'Enviado';
    }
  }

  statusBadgeClass(status: DocumentStatus | null | undefined): string {
    const base = 'rounded-full px-2.5 py-0.5 text-xs font-medium';
    switch (status) {
      case 'processing': return `${base} bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300`;
      case 'processed':  return `${base} bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300`;
      case 'failed':     return `${base} bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300`;
      default:           return `${base} bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300`;
    }
  }

  cancel(): void {
    this.cancelled.emit();
  }

  onDialogClose(): void {
    this.cancelled.emit();
  }

  submit(): void {
    this.form.markAllAsTouched();
    this.fileTouched.set(true);

    const isCreating = !this.document();
    if (isCreating && !this.selectedFile()) {
      this.fileError.set('Arquivo é obrigatório.');
    }

    if (this.form.invalid || this.loading()) return;
    if (isCreating && !this.selectedFile()) return;

    const raw = this.form.getRawValue();
    this.loading.set(true);
    this.error.set(null);

    const operation$ = isCreating
      ? this.documentService.create({
          name: raw.name!.trim(),
          description: raw.description ?? null,
          file: this.selectedFile()!,
        })
      : this.documentService.update(this.document()!.id, {
          name: raw.name!.trim(),
          description: raw.description ?? null,
          ...(this.selectedFile() ? { file: this.selectedFile()! } : {}),
        });

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
