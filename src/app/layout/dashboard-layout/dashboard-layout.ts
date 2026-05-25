import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar';
import { HeaderComponent } from '../header/header';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex h-screen bg-neutral-50 dark:bg-neutral-950 overflow-hidden">
      <!-- Mobile overlay -->
      @if (sidebarOpen()) {
        <div
          class="fixed inset-0 z-30 bg-black/40 lg:hidden"
          (click)="sidebarOpen.set(false)"
          aria-hidden="true"
        ></div>
      }

      <!-- Sidebar -->
      <app-sidebar
        [open]="sidebarOpen()"
        (close)="sidebarOpen.set(false)"
      />

      <!-- Main area -->
      <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
        <app-header (sidebarToggle)="sidebarOpen.update(v => !v)"/>

        <main
          id="main-content"
          class="flex-1 overflow-y-auto p-4 md:p-6"
          tabindex="-1"
        >
          <router-outlet/>
        </main>
      </div>
    </div>
  `,
})
export class DashboardLayoutComponent {
  protected readonly sidebarOpen = signal(false);
}
