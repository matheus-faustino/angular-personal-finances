import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DocumentService } from '../../core/services/document.service';
import { DocumentResource } from '../../../api/models/document-resource';
import { DocumentStatus } from '../../../api/models/document-status';
import { DocumentFormComponent } from './document-form/document-form';

@Component({
  selector: 'app-documents',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, DocumentFormComponent],
  template: `
    <div class="space-y-6">

      <!-- Page header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Documentos</h1>
          <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            @if (auth.isAdmin()) {
              Visualize os documentos dos usuários.
            } @else {
              Gerencie seus documentos.
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
            Novo documento
          </button>
        }
      </div>

      <!-- Filter bar -->
      <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-5 py-4">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <label for="filter-start" class="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
              Data inicial
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
              Data final
            </label>
            <input
              id="filter-end"
              type="date"
              [value]="filterEndDate()"
              (change)="filterEndDate.set($any($event.target).value)"
              class="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
            />
          </div>
        </div>
        <div class="flex gap-2 mt-3">
          <button
            type="button"
            (click)="applyFilters()"
            class="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            Filtrar
          </button>
          <button
            type="button"
            (click)="clearFilters()"
            class="rounded-lg border border-neutral-200 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Limpar
          </button>
        </div>
      </div>

      <!-- Success banner (from categorize redirect) -->
      @if (successMessage()) {
        <div
          role="status"
          class="flex items-center justify-between rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-400"
        >
          <span>{{ successMessage() }}</span>
          <button
            type="button"
            (click)="successMessage.set(null)"
            aria-label="Fechar"
            class="ml-4 rounded p-0.5 hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      }

      <!-- Load error banner -->
      @if (documentService.error()) {
        <div
          role="alert"
          class="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400"
        >
          {{ documentService.error() }}
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
      @if (documentService.loading()) {
        <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
          <div class="divide-y divide-neutral-100 dark:divide-neutral-800">
            @for (_ of skeletonRows; track $index) {
              <div class="px-6 py-4 flex gap-4">
                <div class="h-4 w-40 rounded bg-neutral-100 dark:bg-neutral-800 animate-pulse"></div>
                <div class="h-4 w-32 rounded bg-neutral-100 dark:bg-neutral-800 animate-pulse"></div>
                <div class="h-4 w-20 rounded bg-neutral-100 dark:bg-neutral-800 animate-pulse"></div>
                <div class="h-4 w-24 rounded bg-neutral-100 dark:bg-neutral-800 animate-pulse"></div>
              </div>
            }
          </div>
        </div>
      } @else {

        <!-- Empty state -->
        @if (documentService.documents().length === 0) {
          <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-6 py-12 text-center">
            <p class="text-sm text-neutral-500 dark:text-neutral-400">Nenhum documento encontrado.</p>
            @if (!auth.isAdmin()) {
              <button
                type="button"
                (click)="openCreate()"
                class="mt-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                Enviar primeiro documento
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
                    Nome
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide hidden sm:table-cell">
                    Descrição
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide hidden md:table-cell">
                    Criado em
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800">
                @for (doc of documentService.documents(); track doc.id) {
                  <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                    <td class="px-6 py-4 text-neutral-900 dark:text-neutral-100 font-medium">
                      {{ doc.name }}
                    </td>
                    <td class="px-6 py-4 text-neutral-500 dark:text-neutral-400 hidden sm:table-cell">
                      {{ doc.description ?? '—' }}
                    </td>
                    <td class="px-6 py-4">
                      <span [class]="statusBadgeClass(doc.status)">{{ statusLabel(doc.status) }}</span>
                    </td>
                    <td class="px-6 py-4 text-neutral-500 dark:text-neutral-400 whitespace-nowrap hidden md:table-cell">
                      {{ doc.created_at | date:'dd/MM/yyyy' }}
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="inline-flex items-center gap-2">
                        @if (auth.isAdmin()) {
                          <button
                            type="button"
                            (click)="openDetail(doc)"
                            class="rounded px-2 py-1 text-xs font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                          >
                            Ver
                          </button>
                          <button
                            type="button"
                            [disabled]="downloadingId() === doc.id"
                            (click)="downloadDocument(doc)"
                            [attr.aria-label]="'Baixar ' + doc.name"
                            class="rounded px-2 py-1 text-xs font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                          >
                            @if (downloadingId() === doc.id) { … } @else { Baixar }
                          </button>
                        } @else {
                          @if (pendingDeleteId() === doc.id) {
                            <span class="text-xs text-neutral-600 dark:text-neutral-400">Excluir?</span>
                            <button
                              type="button"
                              [disabled]="mutatingId() === doc.id"
                              (click)="confirmDelete(doc.id)"
                              class="rounded px-2 py-1 text-xs font-medium bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white transition-colors"
                            >
                              @if (mutatingId() === doc.id) { … } @else { Sim }
                            </button>
                            <button
                              type="button"
                              (click)="pendingDeleteId.set(null)"
                              class="rounded px-2 py-1 text-xs font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                            >
                              Não
                            </button>
                          } @else {
                            @if (doc.status === 'processed') {
                              <a
                                [routerLink]="['/documents', doc.id, 'categorize']"
                                class="rounded px-2 py-1 text-xs font-medium border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                              >
                                Categorizar
                              </a>
                            }
                            <button
                              type="button"
                              (click)="openEdit(doc)"
                              class="rounded px-2 py-1 text-xs font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              [disabled]="downloadingId() === doc.id"
                              (click)="downloadDocument(doc)"
                              [attr.aria-label]="'Baixar ' + doc.name"
                              class="rounded px-2 py-1 text-xs font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                            >
                              @if (downloadingId() === doc.id) { … } @else { Baixar }
                            </button>
                            <button
                              type="button"
                              (click)="pendingDeleteId.set(doc.id)"
                              class="rounded px-2 py-1 text-xs font-medium border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                            >
                              Excluir
                            </button>
                          }
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      }

      <!-- Document form / detail modal -->
      <app-document-form
        [open]="modalOpen()"
        [document]="editingDocument()"
        [readonly]="detailMode()"
        (saved)="onSaved($event)"
        (cancelled)="closeModal()"
      />

    </div>
  `,
})
export class DocumentsComponent implements OnInit {
  protected readonly auth            = inject(AuthService);
  protected readonly documentService = inject(DocumentService);

  protected readonly filterStartDate = signal<string>('');
  protected readonly filterEndDate   = signal<string>('');

  protected readonly modalOpen       = signal<boolean>(false);
  protected readonly editingDocument = signal<DocumentResource | null>(null);
  protected readonly detailMode      = signal<boolean>(false);

  protected readonly pendingDeleteId = signal<number | null>(null);
  protected readonly mutatingId      = signal<number | null>(null);
  protected readonly deleteError     = signal<string | null>(null);
  protected readonly downloadingId   = signal<number | null>(null);
  protected readonly successMessage  = signal<string | null>(null);

  protected readonly skeletonRows = Array(5);

  ngOnInit(): void {
    this.documentService.loadDocuments();
    const flash = history.state?.flash;
    if (typeof flash === 'string') {
      this.successMessage.set(flash);
      history.replaceState({ ...history.state, flash: null }, '');
    }
  }

  protected applyFilters(): void {
    this.documentService.loadDocuments({
      start_date: this.filterStartDate() || null,
      end_date:   this.filterEndDate()   || null,
    });
  }

  protected clearFilters(): void {
    this.filterStartDate.set('');
    this.filterEndDate.set('');
    this.documentService.loadDocuments();
  }

  protected openCreate(): void {
    this.editingDocument.set(null);
    this.detailMode.set(false);
    this.modalOpen.set(true);
  }

  protected openEdit(doc: DocumentResource): void {
    this.editingDocument.set(doc);
    this.detailMode.set(false);
    this.modalOpen.set(true);
  }

  protected openDetail(doc: DocumentResource): void {
    this.editingDocument.set(doc);
    this.detailMode.set(true);
    this.modalOpen.set(true);
  }

  protected closeModal(): void {
    this.modalOpen.set(false);
    this.editingDocument.set(null);
    this.detailMode.set(false);
  }

  protected onSaved(_doc: DocumentResource): void {
    this.closeModal();
  }

  protected confirmDelete(id: number): void {
    this.mutatingId.set(id);
    this.deleteError.set(null);
    this.documentService.remove(id).subscribe({
      next: () => {
        this.pendingDeleteId.set(null);
        this.mutatingId.set(null);
      },
      error: err => {
        this.mutatingId.set(null);
        this.pendingDeleteId.set(null);
        this.deleteError.set(err?.error?.message ?? 'Erro ao excluir documento. Tente novamente.');
      },
    });
  }

  protected downloadDocument(doc: DocumentResource): void {
    this.downloadingId.set(doc.id);
    this.documentService.download(doc.id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.name;
        a.click();
        URL.revokeObjectURL(url);
        this.downloadingId.set(null);
      },
      error: () => {
        this.downloadingId.set(null);
      },
    });
  }

  protected statusLabel(status: DocumentStatus | null): string {
    switch (status) {
      case 'processing': return 'Processando';
      case 'processed':  return 'Processado';
      case 'failed':     return 'Falhou';
      default:           return 'Enviado';
    }
  }

  protected statusBadgeClass(status: DocumentStatus | null): string {
    const base = 'rounded-full px-2.5 py-0.5 text-xs font-medium';
    switch (status) {
      case 'processing': return `${base} bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300`;
      case 'processed':  return `${base} bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300`;
      case 'failed':     return `${base} bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300`;
      default:           return `${base} bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300`;
    }
  }
}
