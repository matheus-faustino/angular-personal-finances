import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { UserResource } from '../../../api/models/user-resource';
import { UserFormComponent } from './user-form/user-form';

@Component({
  selector: 'app-users',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, UserFormComponent, TranslocoModule],
  template: `
    <ng-container *transloco="let t">
      <div class="space-y-6">

        <!-- Page header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{{ t('users.title') }}</h1>
            <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{{ t('users.subtitle') }}</p>
          </div>
          <button
            type="button"
            (click)="openCreate()"
            class="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            {{ t('users.newUser') }}
          </button>
        </div>

        <!-- Load error banner -->
        @if (userService.error()) {
          <div
            role="alert"
            class="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400"
          >
            {{ userService.error() }}
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
              [attr.aria-label]="t('users.closeAlert')"
              class="ml-4 rounded p-0.5 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        }

        <!-- Loading skeleton -->
        @if (userService.loading()) {
          <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
            <div class="divide-y divide-neutral-100 dark:divide-neutral-800">
              @for (_ of skeletonRows; track $index) {
                <div class="px-6 py-4 flex gap-4">
                  <div class="h-4 w-40 rounded bg-neutral-100 dark:bg-neutral-800 animate-pulse"></div>
                  <div class="h-4 w-48 rounded bg-neutral-100 dark:bg-neutral-800 animate-pulse"></div>
                  <div class="h-4 w-24 rounded bg-neutral-100 dark:bg-neutral-800 animate-pulse"></div>
                  <div class="h-4 w-24 rounded bg-neutral-100 dark:bg-neutral-800 animate-pulse"></div>
                </div>
              }
            </div>
          </div>
        } @else {

          <!-- Empty state -->
          @if (userService.users().length === 0) {
            <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-6 py-12 text-center">
              <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ t('users.empty') }}</p>
              <button
                type="button"
                (click)="openCreate()"
                class="mt-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                {{ t('users.createFirst') }}
              </button>
            </div>
          } @else {

            <!-- Table -->
            <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
              <table class="w-full text-sm">
                <thead class="bg-neutral-50 dark:bg-neutral-800/50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">{{ t('users.colName') }}</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">{{ t('users.colEmail') }}</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">{{ t('users.colRole') }}</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">{{ t('users.colCreatedAt') }}</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">{{ t('users.colActions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800">
                  @for (user of userService.users(); track user.id) {
                    <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                      <td class="px-6 py-4 text-neutral-900 dark:text-neutral-100 font-medium">{{ user.name }}</td>
                      <td class="px-6 py-4 text-neutral-500 dark:text-neutral-400">{{ user.email }}</td>
                      <td class="px-6 py-4 text-neutral-500 dark:text-neutral-400">
                        {{ user.role === 'admin' ? t('users.roleAdmin') : t('users.roleUser') }}
                      </td>
                      <td class="px-6 py-4 text-neutral-500 dark:text-neutral-400">
                        {{ user.created_at | date:'dd/MM/yyyy' }}
                      </td>
                      <td class="px-6 py-4 text-right">
                        @if (pendingDeleteId() === user.id) {
                          <div class="inline-flex items-center gap-2">
                            <span class="text-xs text-neutral-600 dark:text-neutral-400">{{ t('users.deleteConfirm') }}</span>
                            <button
                              type="button"
                              [disabled]="mutatingId() === user.id"
                              (click)="confirmDelete(user.id)"
                              class="rounded px-2 py-1 text-xs font-medium bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white transition-colors"
                            >
                              @if (mutatingId() === user.id) { … } @else { {{ t('common.yes') }} }
                            </button>
                            <button
                              type="button"
                              (click)="pendingDeleteId.set(null)"
                              class="rounded px-2 py-1 text-xs font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                            >
                              {{ t('common.no') }}
                            </button>
                          </div>
                        } @else {
                          <div class="inline-flex items-center gap-2">
                            @if (auth.currentUser()?.id !== user.id) {
                              <a
                                [routerLink]="['/transactions']"
                                [queryParams]="{ user_id: user.id }"
                                class="rounded px-2 py-1 text-xs font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                              >
                                {{ t('users.transactions') }}
                              </a>
                              <a
                                [routerLink]="['/documents']"
                                [queryParams]="{ user_id: user.id }"
                                class="rounded px-2 py-1 text-xs font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                              >
                                {{ t('users.documents') }}
                              </a>
                            }
                            <button
                              type="button"
                              (click)="openEdit(user)"
                              class="rounded px-2 py-1 text-xs font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                            >
                              {{ t('users.edit') }}
                            </button>
                            @if (auth.currentUser()?.id !== user.id) {
                              <button
                                type="button"
                                (click)="pendingDeleteId.set(user.id)"
                                class="rounded px-2 py-1 text-xs font-medium border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                              >
                                {{ t('users.delete') }}
                              </button>
                            }
                          </div>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }

        <app-user-form
          [open]="modalOpen()"
          [user]="editingUser()"
          (saved)="onSaved($event)"
          (cancelled)="closeModal()"
        />

      </div>
    </ng-container>
  `,
})
export class UsersComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  protected readonly userService = inject(UserService);
  private readonly t = inject(TranslocoService);

  protected readonly pendingDeleteId = signal<number | null>(null);
  protected readonly mutatingId = signal<number | null>(null);
  protected readonly deleteError = signal<string | null>(null);
  protected readonly modalOpen = signal<boolean>(false);
  protected readonly editingUser = signal<UserResource | null>(null);

  protected readonly skeletonRows = Array(5);

  ngOnInit(): void {
    this.userService.loadUsers();
  }

  protected openCreate(): void {
    this.editingUser.set(null);
    this.modalOpen.set(true);
  }

  protected openEdit(user: UserResource): void {
    this.editingUser.set(user);
    this.modalOpen.set(true);
  }

  protected closeModal(): void {
    this.modalOpen.set(false);
    this.editingUser.set(null);
  }

  protected onSaved(_user: UserResource): void {
    this.closeModal();
  }

  protected confirmDelete(id: number): void {
    this.mutatingId.set(id);
    this.deleteError.set(null);
    this.userService.remove(id).subscribe({
      next: () => {
        this.pendingDeleteId.set(null);
        this.mutatingId.set(null);
      },
      error: err => {
        this.mutatingId.set(null);
        this.pendingDeleteId.set(null);
        this.deleteError.set(err?.error?.message ?? this.t.translate('users.deleteError'));
      },
    });
  }
}
