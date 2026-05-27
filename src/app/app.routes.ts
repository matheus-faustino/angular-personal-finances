import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/dashboard-layout/dashboard-layout').then(
        m => m.DashboardLayoutComponent,
      ),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then(m => m.DashboardComponent),
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./features/transactions/transactions').then(m => m.TransactionsComponent),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/categories/categories').then(m => m.CategoriesComponent),
      },
      {
        path: 'documents',
        loadComponent: () =>
          import('./features/documents/documents').then(m => m.DocumentsComponent),
      },
      {
        path: 'documents/:id/categorize',
        loadComponent: () =>
          import('./features/documents/categorize-transactions/categorize-transactions').then(
            m => m.CategorizeTransactionsComponent,
          ),
      },
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
        loadComponent: () =>
          import('./features/users/users').then(m => m.UsersComponent),
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login').then(m => m.LoginComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/reset-password/reset-password').then(m => m.ResetPasswordComponent),
  },
  { path: '**', redirectTo: '' },
];
