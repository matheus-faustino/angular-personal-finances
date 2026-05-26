import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NAV_ITEMS, NavItem } from '../nav-items';
import { ProfileFormComponent } from '../profile-form/profile-form';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, ProfileFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside
      [class]="sidebarClass()"
      aria-label="Navegação principal"
    >
      <!-- Brand -->
      <div class="flex items-center gap-2 px-6 h-16 border-b border-neutral-200 dark:border-neutral-700">
        <div class="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0" aria-hidden="true">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
        </div>
        <span class="font-semibold text-neutral-900 dark:text-neutral-100 truncate">Finanças</span>
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        @for (item of visibleItems(); track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
            [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
            class="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            (click)="close.emit()"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="item.icon"/>
            </svg>
            {{ item.label }}
          </a>
        }
      </nav>

      <!-- User footer -->
      <div class="px-4 py-4 border-t border-neutral-200 dark:border-neutral-700">
        @if (auth.currentUser(); as user) {
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <span class="text-xs font-semibold text-white">{{ initials(user.name) }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{{ user.name }}</p>
              <p class="text-xs text-neutral-500 dark:text-neutral-400 truncate capitalize">{{ user.role }}</p>
            </div>
            <button
              type="button"
              (click)="profileOpen.set(true)"
              aria-label="Editar perfil"
              class="flex-shrink-0 rounded-lg p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          </div>
        }
      </div>
    </aside>

    <app-profile-form
      [open]="profileOpen()"
      (saved)="profileOpen.set(false)"
      (cancelled)="profileOpen.set(false)"
    />
  `,
})
export class SidebarComponent {
  readonly open = input<boolean>(false);
  readonly close = output<void>();

  protected readonly auth = inject(AuthService);
  protected readonly profileOpen = signal(false);

  protected readonly visibleItems = computed<NavItem[]>(() => {
    const role = this.auth.role();
    if (!role) return [];
    return NAV_ITEMS.filter(item => item.roles.includes(role));
  });

  protected readonly sidebarClass = computed(() => {
    const base =
      'flex flex-col h-full bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-700 w-64 transition-transform duration-200 ease-in-out';
    const mobile = this.open()
      ? 'fixed inset-y-0 left-0 z-40 translate-x-0'
      : 'fixed inset-y-0 left-0 z-40 -translate-x-full';
    return `${base} ${mobile} lg:relative lg:translate-x-0 lg:flex lg:flex-shrink-0`;
  });

  protected initials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }
}
