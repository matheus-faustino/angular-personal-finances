import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { map, tap, catchError, finalize } from 'rxjs/operators';
import { ApiConfiguration } from '../../../api/api-configuration';
import { DocumentResource } from '../../../api/models/document-resource';
import { StoreDocumentRequest } from '../../../api/models/store-document-request';
import { UpdateDocumentRequest } from '../../../api/models/update-document-request';
import { documentsIndex } from '../../../api/fn/document/documents-index';
import { documentsStore } from '../../../api/fn/document/documents-store';
import { documentsUpdate } from '../../../api/fn/document/documents-update';
import { documentsDestroy } from '../../../api/fn/document/documents-destroy';

export interface DocumentFilters {
  start_date?: string | null;
  end_date?: string | null;
  per_page?: number | null;
}

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfiguration);

  readonly documents = signal<DocumentResource[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  loadDocuments(filters?: DocumentFilters): void {
    this.loading.set(true);
    this.error.set(null);
    documentsIndex(this.http, this.apiConfig.rootUrl, filters)
      .pipe(
        map(r => r.body.data),
        tap(data => this.documents.set(data)),
        catchError(err => {
          this.error.set(err?.error?.message ?? 'Erro ao carregar documentos. Tente novamente.');
          return EMPTY;
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe();
  }

  create(body: StoreDocumentRequest): Observable<DocumentResource> {
    return documentsStore(this.http, this.apiConfig.rootUrl, { body }).pipe(
      map(r => r.body.data),
      tap(created => this.documents.update(list => [created, ...list])),
    );
  }

  update(id: number, body: UpdateDocumentRequest): Observable<DocumentResource> {
    return documentsUpdate(this.http, this.apiConfig.rootUrl, { document: id, body }).pipe(
      map(r => r.body.data),
      tap(updated => this.documents.update(list => list.map(d => (d.id === id ? updated : d)))),
    );
  }

  remove(id: number): Observable<void> {
    return documentsDestroy(this.http, this.apiConfig.rootUrl, { document: id }).pipe(
      map(() => undefined),
      tap(() => this.documents.update(list => list.filter(d => d.id !== id))),
    );
  }

  download(id: number): Observable<Blob> {
    return this.http.get(`${this.apiConfig.rootUrl}/documents/${id}/download`, {
      responseType: 'blob',
    });
  }
}
