import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, EMPTY, finalize, map, tap } from 'rxjs';
import type { Observable } from 'rxjs';
import { ApiConfiguration } from '../../../api/api-configuration';
import { TransactionResource } from '../../../api/models/transaction-resource';
import { StoreTransactionRequest } from '../../../api/models/store-transaction-request';
import { UpdateTransactionRequest } from '../../../api/models/update-transaction-request';
import { transactionsIndex } from '../../../api/fn/transaction/transactions-index';
import { transactionsStore } from '../../../api/fn/transaction/transactions-store';
import { transactionsUpdate } from '../../../api/fn/transaction/transactions-update';
import { transactionsDestroy } from '../../../api/fn/transaction/transactions-destroy';

export interface TransactionFilters {
  start_date?: string | null;
  end_date?: string | null;
  category_id?: number | null;
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfiguration);

  readonly transactions = signal<TransactionResource[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  loadTransactions(filters?: TransactionFilters): void {
    this.loading.set(true);
    this.error.set(null);
    transactionsIndex(this.http, this.apiConfig.rootUrl, {
      start_date: filters?.start_date ?? null,
      end_date: filters?.end_date ?? null,
      category_id: filters?.category_id ?? null,
    })
      .pipe(
        map(r => r.body.data),
        tap(data => this.transactions.set(data)),
        catchError(err => {
          this.error.set(err?.error?.message ?? 'Erro ao carregar transações.');
          return EMPTY;
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe();
  }

  create(body: StoreTransactionRequest): Observable<TransactionResource> {
    return transactionsStore(this.http, this.apiConfig.rootUrl, { body }).pipe(
      map(r => r.body.data),
      tap(created => this.transactions.update(list => [...list, created])),
    );
  }

  update(id: number, body: UpdateTransactionRequest): Observable<TransactionResource> {
    return transactionsUpdate(this.http, this.apiConfig.rootUrl, { transaction: id, body }).pipe(
      map(r => r.body.data),
      tap(updated => this.transactions.update(list => list.map(t => (t.id === id ? updated : t)))),
    );
  }

  remove(id: number): Observable<void> {
    return transactionsDestroy(this.http, this.apiConfig.rootUrl, { transaction: id }).pipe(
      map(() => undefined),
      tap(() => this.transactions.update(list => list.filter(t => t.id !== id))),
    );
  }
}
