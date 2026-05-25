import { computed, Injectable, signal } from '@angular/core';
import { UserResource } from '../../../api/models/user-resource';
import { Role } from '../../../api/models/role';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<UserResource | null>(null);

  readonly role = computed<Role | null>(() => this.currentUser()?.role ?? null);

  readonly isAdmin = computed(() => this.role() === 'admin');

  isAuthenticated = computed(() => this.currentUser() !== null);

  hasRole(role: Role): boolean {
    return this.role() === role;
  }

  setUser(user: UserResource): void {
    this.currentUser.set(user);
  }

  clearUser(): void {
    this.currentUser.set(null);
  }
}
