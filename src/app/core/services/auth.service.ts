import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, map, of, switchMap, tap } from 'rxjs';
import type { Observable } from 'rxjs';
import { ApiConfiguration } from '../../../api/api-configuration';
import { UserResource } from '../../../api/models/user-resource';
import { Role } from '../../../api/models/role';
import { authLogin } from '../../../api/fn/login/auth-login';
import { authLogout } from '../../../api/fn/login/auth-logout';
import { userGet } from '../../../api/fn/operations/user-get';

const TOKEN_KEY = 'auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfiguration);

  readonly currentUser = signal<UserResource | null>(null);
  readonly role = computed<Role | null>(() => this.currentUser()?.role ?? null);
  readonly isAdmin = computed(() => this.role() === 'admin');
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.currentUser.set(null);
  }

  hasRole(role: Role): boolean {
    return this.role() === role;
  }

  login(email: string, password: string): Observable<void> {
    return authLogin(this.http, this.apiConfig.rootUrl, { body: { email, password } }).pipe(
      switchMap(response => {
        this.setToken(response.body.token);
        return userGet(this.http, this.apiConfig.rootUrl);
      }),
      tap(response => this.currentUser.set(response.body)),
      map(() => undefined),
    );
  }

  logout(): Observable<void> {
    return authLogout(this.http, this.apiConfig.rootUrl).pipe(
      finalize(() => this.clearSession()),
      map(() => undefined),
    );
  }

  init(): Observable<void> {
    if (!this.getToken()) return of(undefined);

    return userGet(this.http, this.apiConfig.rootUrl).pipe(
      tap(response => this.currentUser.set(response.body)),
      catchError(() => {
        this.clearSession();
        return of(undefined);
      }),
      map(() => undefined),
    );
  }
}
