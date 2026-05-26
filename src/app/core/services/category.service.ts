import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, EMPTY, finalize, map, tap } from 'rxjs';
import type { Observable } from 'rxjs';
import { ApiConfiguration } from '../../../api/api-configuration';
import { CategoryResource } from '../../../api/models/category-resource';
import { categoriesIndex } from '../../../api/fn/category/categories-index';
import { categoriesStore } from '../../../api/fn/category/categories-store';
import { categoriesUpdate } from '../../../api/fn/category/categories-update';
import { categoriesDestroy } from '../../../api/fn/category/categories-destroy';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfiguration);

  readonly categories = signal<CategoryResource[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  loadCategories(): void {
    this.loading.set(true);
    this.error.set(null);
    categoriesIndex(this.http, this.apiConfig.rootUrl)
      .pipe(
        map(r => r.body.data),
        tap(data => this.categories.set(data)),
        catchError(err => {
          this.error.set(err?.error?.message ?? 'Erro ao carregar categorias.');
          return EMPTY;
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe();
  }

  create(name: string): Observable<CategoryResource> {
    return categoriesStore(this.http, this.apiConfig.rootUrl, { body: { name } }).pipe(
      map(r => r.body.data),
      tap(created => this.categories.update(list => [...list, created])),
    );
  }

  update(id: number, name: string): Observable<CategoryResource> {
    return categoriesUpdate(this.http, this.apiConfig.rootUrl, { category: id, body: { name } }).pipe(
      map(r => r.body.data),
      tap(updated => this.categories.update(list => list.map(c => (c.id === id ? updated : c)))),
    );
  }

  remove(id: number): Observable<void> {
    return categoriesDestroy(this.http, this.apiConfig.rootUrl, { category: id }).pipe(
      map(() => undefined),
      tap(() => this.categories.update(list => list.filter(c => c.id !== id))),
    );
  }
}
