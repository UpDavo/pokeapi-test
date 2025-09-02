import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumeric = /[0-9]/.test(value);
  const isValid = hasUpperCase && hasLowerCase && hasNumeric && value.length >= 8;
  return isValid ? null : { invalidPassword: true };
}

export function confirmPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const form = control.parent;
  if (!form) return null;
  const password = form.get('password')?.value;
  const confirm = control.value;
  return password === confirm ? null : { passwordsMismatch: true };
}
