import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { UserResource } from '../../../../api/models/user-resource';
import { UserService } from '../../../core/services/user.service';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('password')?.value;
  const confirm = group.get('password_confirmation')?.value;
  if (!pw) return null;
  return pw === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-user-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <dialog
      #dialogEl
      class="m-auto w-full max-w-md rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-0 shadow-xl backdrop:bg-black/40 open:flex open:flex-col"
      (close)="onDialogClose()"
      aria-labelledby="user-dialog-title"
    >
      <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
        <h2
          id="user-dialog-title"
          class="text-base font-semibold text-neutral-900 dark:text-neutral-100"
        >
          @if (user()) { Editar usuário } @else { Novo usuário }
        </h2>
        <button
          type="button"
          (click)="cancel()"
          aria-label="Fechar"
          class="rounded-lg p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="px-6 py-4 flex flex-col gap-4">

        @if (error()) {
          <div
            role="alert"
            class="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400"
          >
            {{ error() }}
          </div>
        }

        <div class="flex flex-col gap-1.5">
          <label for="user-name" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Nome</label>
          <input
            id="user-name"
            type="text"
            formControlName="name"
            [attr.aria-invalid]="nameError() ? 'true' : null"
            [attr.aria-describedby]="nameError() ? 'user-name-error' : null"
            placeholder="Ex: João Silva"
            class="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
            [class.border-red-400]="nameError()"
            [class.dark:border-red-500]="nameError()"
          />
          @if (nameError()) {
            <p id="user-name-error" class="text-xs text-red-600 dark:text-red-400">{{ nameError() }}</p>
          }
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="user-email" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">E-mail</label>
          <input
            id="user-email"
            type="email"
            formControlName="email"
            [attr.aria-invalid]="emailError() ? 'true' : null"
            [attr.aria-describedby]="emailError() ? 'user-email-error' : null"
            placeholder="Ex: joao@email.com"
            class="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
            [class.border-red-400]="emailError()"
            [class.dark:border-red-500]="emailError()"
          />
          @if (emailError()) {
            <p id="user-email-error" class="text-xs text-red-600 dark:text-red-400">{{ emailError() }}</p>
          }
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="user-password" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Senha
            @if (user()) {
              <span class="font-normal text-neutral-400">(opcional)</span>
            }
          </label>
          <input
            id="user-password"
            type="password"
            formControlName="password"
            [attr.aria-invalid]="passwordError() ? 'true' : null"
            [attr.aria-describedby]="passwordError() ? 'user-password-error' : null"
            placeholder="Mínimo 8 caracteres"
            class="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
            [class.border-red-400]="passwordError()"
            [class.dark:border-red-500]="passwordError()"
          />
          @if (passwordError()) {
            <p id="user-password-error" class="text-xs text-red-600 dark:text-red-400">{{ passwordError() }}</p>
          }
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="user-pwd-confirm" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Confirmar senha</label>
          <input
            id="user-pwd-confirm"
            type="password"
            formControlName="password_confirmation"
            [attr.aria-invalid]="passwordConfirmationError() ? 'true' : null"
            [attr.aria-describedby]="passwordConfirmationError() ? 'user-pwd-confirm-error' : null"
            placeholder="Repita a senha"
            class="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
            [class.border-red-400]="passwordConfirmationError()"
            [class.dark:border-red-500]="passwordConfirmationError()"
          />
          @if (passwordConfirmationError()) {
            <p id="user-pwd-confirm-error" class="text-xs text-red-600 dark:text-red-400">{{ passwordConfirmationError() }}</p>
          }
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="user-role" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Perfil</label>
          <select
            id="user-role"
            formControlName="role"
            [attr.aria-invalid]="roleError() ? 'true' : null"
            [attr.aria-describedby]="roleError() ? 'user-role-error' : null"
            class="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
            [class.border-red-400]="roleError()"
            [class.dark:border-red-500]="roleError()"
          >
            <option value="user">Usuário</option>
            <option value="admin">Administrador</option>
          </select>
          @if (roleError()) {
            <p id="user-role-error" class="text-xs text-red-600 dark:text-red-400">{{ roleError() }}</p>
          }
        </div>

        <div class="flex justify-end gap-3 pt-1">
          <button
            type="button"
            (click)="cancel()"
            class="rounded-lg border border-neutral-200 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            [disabled]="loading()"
            [attr.aria-busy]="loading() ? 'true' : null"
            class="rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            @if (loading()) { Salvando… } @else { Salvar }
          </button>
        </div>
      </form>
    </dialog>
  `,
})
export class UserFormComponent {
  readonly open = input<boolean>(false);
  readonly user = input<UserResource | null>(null);

  readonly saved = output<UserResource>();
  readonly cancelled = output<void>();

  private readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = viewChild<ElementRef<HTMLDialogElement>>('dialogEl');

  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      password: ['', []],
      password_confirmation: ['', []],
      role: ['user', [Validators.required]],
    },
    { validators: passwordMatchValidator },
  );

  constructor() {
    effect(() => {
      const dialogEl = this.dialogRef()?.nativeElement;
      if (!dialogEl) return;

      if (this.open()) {
        const u = this.user();
        this.form.reset({
          name: u?.name ?? '',
          email: u?.email ?? '',
          password: '',
          password_confirmation: '',
          role: u?.role ?? 'user',
        });
        this.error.set(null);
        dialogEl.showModal();
      } else {
        dialogEl.close();
      }
    });
  }

  nameError(): string | null {
    const ctrl = this.form.controls.name;
    if (!ctrl.touched) return null;
    if (ctrl.hasError('required')) return 'Nome é obrigatório.';
    if (ctrl.hasError('minlength')) return 'Nome deve ter ao menos 2 caracteres.';
    if (ctrl.hasError('maxlength')) return 'Nome deve ter no máximo 150 caracteres.';
    return null;
  }

  emailError(): string | null {
    const ctrl = this.form.controls.email;
    if (!ctrl.touched) return null;
    if (ctrl.hasError('required')) return 'E-mail é obrigatório.';
    if (ctrl.hasError('email')) return 'Informe um e-mail válido.';
    return null;
  }

  passwordError(): string | null {
    const ctrl = this.form.controls.password;
    if (!ctrl.touched) return null;
    if (ctrl.hasError('required')) return 'Senha é obrigatória.';
    if (ctrl.hasError('minlength')) return 'Senha deve ter ao menos 8 caracteres.';
    return null;
  }

  passwordConfirmationError(): string | null {
    const ctrl = this.form.controls.password_confirmation;
    if (!ctrl.touched) return null;
    if (this.form.hasError('passwordMismatch')) return 'As senhas não coincidem.';
    return null;
  }

  roleError(): string | null {
    const ctrl = this.form.controls.role;
    if (!ctrl.touched) return null;
    if (ctrl.hasError('required')) return 'Perfil é obrigatório.';
    return null;
  }

  cancel(): void {
    this.cancelled.emit();
  }

  onDialogClose(): void {
    this.cancelled.emit();
  }

  submit(): void {
    const passwordCtrl = this.form.controls.password;
    const isCreating = !this.user();

    if (isCreating) {
      passwordCtrl.setValidators([Validators.required, Validators.minLength(8)]);
    } else {
      passwordCtrl.setValidators(passwordCtrl.value ? [Validators.minLength(8)] : []);
    }
    passwordCtrl.updateValueAndValidity();

    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading()) return;

    const { name, email, password, password_confirmation, role } = this.form.getRawValue();
    this.loading.set(true);
    this.error.set(null);

    const existingUser = this.user();
    const operation$ = existingUser
      ? this.userService.update(existingUser.id, {
          name: name!.trim(),
          email: email!,
          role: role as 'admin' | 'user',
          ...(password ? { password: password, password_confirmation: password_confirmation ?? '' } : {}),
        })
      : this.userService.create({
          name: name!.trim(),
          email: email!,
          password: password!,
          password_confirmation: password_confirmation!,
          role: role as 'admin' | 'user',
        });

    operation$.subscribe({
      next: saved => {
        this.loading.set(false);
        this.saved.emit(saved);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Ocorreu um erro. Tente novamente.');
      },
    });
  }
}
