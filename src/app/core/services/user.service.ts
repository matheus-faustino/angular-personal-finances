import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, EMPTY, finalize, map, tap } from 'rxjs';
import type { Observable } from 'rxjs';
import { ApiConfiguration } from '../../../api/api-configuration';
import { UserResource } from '../../../api/models/user-resource';
import { StoreUserRequest } from '../../../api/models/store-user-request';
import { UpdateUserRequest } from '../../../api/models/update-user-request';
import { usersIndex } from '../../../api/fn/user/users-index';
import { usersStore } from '../../../api/fn/user/users-store';
import { usersUpdate } from '../../../api/fn/user/users-update';
import { usersDestroy } from '../../../api/fn/user/users-destroy';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfiguration);

  readonly users = signal<UserResource[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);
    usersIndex(this.http, this.apiConfig.rootUrl)
      .pipe(
        map(r => r.body.data),
        tap(data => this.users.set(data)),
        catchError(err => {
          this.error.set(err?.error?.message ?? 'Erro ao carregar usuários.');
          return EMPTY;
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe();
  }

  create(data: StoreUserRequest): Observable<UserResource> {
    return usersStore(this.http, this.apiConfig.rootUrl, { body: data }).pipe(
      map(r => r.body.data),
      tap(created => this.users.update(list => [...list, created])),
    );
  }

  update(id: number, data: UpdateUserRequest): Observable<UserResource> {
    return usersUpdate(this.http, this.apiConfig.rootUrl, { user: id, body: data }).pipe(
      map(r => r.body.data),
      tap(updated => this.users.update(list => list.map(u => (u.id === id ? updated : u)))),
    );
  }

  remove(id: number): Observable<void> {
    return usersDestroy(this.http, this.apiConfig.rootUrl, { user: id }).pipe(
      map(() => undefined),
      tap(() => this.users.update(list => list.filter(u => u.id !== id))),
    );
  }
}
