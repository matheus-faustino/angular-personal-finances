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
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('password')?.value;
  const confirm = group.get('password_confirmation')?.value;
  if (!pw) return null;
  return pw === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-profile-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslocoModule],
  template: `
    <dialog
      #dialogEl
      class="m-auto w-full max-w-md rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-0 shadow-xl backdrop:bg-black/40 open:flex open:flex-col"
      (close)="onDialogClose()"
      aria-labelledby="profile-dialog-title"
    >
      <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
        <h2
          id="profile-dialog-title"
          class="text-base font-semibold text-neutral-900 dark:text-neutral-100"
        >
          {{ 'profile.title' | transloco }}
        </h2>
        <button
          type="button"
          (click)="cancel()"
          [attr.aria-label]="'profile.close' | transloco"
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
          <label for="profile-name" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {{ 'profile.nameLabel' | transloco }}
          </label>
          <input
            id="profile-name"
            type="text"
            formControlName="name"
            [attr.aria-invalid]="nameError() ? 'true' : null"
            [attr.aria-describedby]="nameError() ? 'profile-name-error' : null"
            [placeholder]="'profile.namePlaceholder' | transloco"
            class="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
            [class.border-red-400]="nameError()"
            [class.dark:border-red-500]="nameError()"
          />
          @if (nameError()) {
            <p id="profile-name-error" class="text-xs text-red-600 dark:text-red-400">{{ nameError() }}</p>
          }
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="profile-email" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {{ 'profile.emailLabel' | transloco }}
          </label>
          <input
            id="profile-email"
            type="email"
            formControlName="email"
            [attr.aria-invalid]="emailError() ? 'true' : null"
            [attr.aria-describedby]="emailError() ? 'profile-email-error' : null"
            [placeholder]="'profile.emailPlaceholder' | transloco"
            class="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
            [class.border-red-400]="emailError()"
            [class.dark:border-red-500]="emailError()"
          />
          @if (emailError()) {
            <p id="profile-email-error" class="text-xs text-red-600 dark:text-red-400">{{ emailError() }}</p>
          }
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="profile-password" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {{ 'profile.passwordLabel' | transloco }}
            <span class="font-normal text-neutral-400">({{ 'profile.passwordOptional' | transloco }})</span>
          </label>
          <input
            id="profile-password"
            type="password"
            formControlName="password"
            [attr.aria-invalid]="passwordError() ? 'true' : null"
            [attr.aria-describedby]="passwordError() ? 'profile-password-error' : null"
            [placeholder]="'profile.passwordPlaceholder' | transloco"
            class="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
            [class.border-red-400]="passwordError()"
            [class.dark:border-red-500]="passwordError()"
          />
          @if (passwordError()) {
            <p id="profile-password-error" class="text-xs text-red-600 dark:text-red-400">{{ passwordError() }}</p>
          }
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="profile-pwd-confirm" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {{ 'profile.passwordConfirmLabel' | transloco }}
          </label>
          <input
            id="profile-pwd-confirm"
            type="password"
            formControlName="password_confirmation"
            [attr.aria-invalid]="passwordConfirmationError() ? 'true' : null"
            [attr.aria-describedby]="passwordConfirmationError() ? 'profile-pwd-confirm-error' : null"
            [placeholder]="'profile.passwordConfirmPlaceholder' | transloco"
            class="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
            [class.border-red-400]="passwordConfirmationError()"
            [class.dark:border-red-500]="passwordConfirmationError()"
          />
          @if (passwordConfirmationError()) {
            <p id="profile-pwd-confirm-error" class="text-xs text-red-600 dark:text-red-400">{{ passwordConfirmationError() }}</p>
          }
        </div>

        <div class="flex justify-end gap-3 pt-1">
          <button
            type="button"
            (click)="cancel()"
            class="rounded-lg border border-neutral-200 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            {{ 'profile.cancel' | transloco }}
          </button>
          <button
            type="submit"
            [disabled]="loading()"
            [attr.aria-busy]="loading() ? 'true' : null"
            class="rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            @if (loading()) { {{ 'profile.saving' | transloco }} } @else { {{ 'profile.save' | transloco }} }
          </button>
        </div>
      </form>
    </dialog>
  `,
})
export class ProfileFormComponent {
  readonly open = input<boolean>(false);

  readonly saved = output<void>();
  readonly cancelled = output<void>();

  private readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = viewChild<ElementRef<HTMLDialogElement>>('dialogEl');
  private readonly t = inject(TranslocoService);

  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      password: ['', []],
      password_confirmation: ['', []],
    },
    { validators: passwordMatchValidator },
  );

  constructor() {
    effect(() => {
      const dialogEl = this.dialogRef()?.nativeElement;
      if (!dialogEl) return;

      if (this.open()) {
        const user = this.auth.currentUser();
        this.form.reset({
          name: user?.name ?? '',
          email: user?.email ?? '',
          password: '',
          password_confirmation: '',
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
    if (ctrl.hasError('required')) return this.t.translate('validation.nameRequired');
    if (ctrl.hasError('minlength')) return this.t.translate('validation.nameMinLength2');
    if (ctrl.hasError('maxlength')) return this.t.translate('validation.nameMaxLength150');
    return null;
  }

  emailError(): string | null {
    const ctrl = this.form.controls.email;
    if (!ctrl.touched) return null;
    if (ctrl.hasError('required')) return this.t.translate('validation.emailRequired');
    if (ctrl.hasError('email')) return this.t.translate('validation.emailInvalid');
    return null;
  }

  passwordError(): string | null {
    const ctrl = this.form.controls.password;
    if (!ctrl.touched) return null;
    if (ctrl.hasError('minlength')) return this.t.translate('validation.passwordMinLength');
    return null;
  }

  passwordConfirmationError(): string | null {
    const ctrl = this.form.controls.password_confirmation;
    if (!ctrl.touched) return null;
    if (this.form.hasError('passwordMismatch')) return this.t.translate('validation.passwordsMismatch');
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
    passwordCtrl.setValidators(passwordCtrl.value ? [Validators.minLength(8)] : []);
    passwordCtrl.updateValueAndValidity();

    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading()) return;

    const currentUser = this.auth.currentUser();
    if (!currentUser) return;

    const { name, email, password, password_confirmation } = this.form.getRawValue();
    this.loading.set(true);
    this.error.set(null);

    this.userService
      .update(currentUser.id, {
        name: name!.trim(),
        email: email!,
        role: currentUser.role,
        ...(password ? { password, password_confirmation: password_confirmation ?? '' } : {}),
      })
      .subscribe({
        next: updatedUser => {
          this.auth.currentUser.set(updatedUser);
          this.loading.set(false);
          this.saved.emit();
        },
        error: err => {
          this.loading.set(false);
          this.error.set(err?.error?.message ?? this.t.translate('profile.genericError'));
        },
      });
  }
}
