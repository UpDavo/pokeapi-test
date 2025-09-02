import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { passwordValidator, confirmPasswordValidator } from '../../utils/authUtils';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
})
export class Register {
  form = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl(''),
    city: new FormControl(''),
    password: new FormControl('', [Validators.required, passwordValidator]),
    confirmPassword: new FormControl('', [Validators.required, confirmPasswordValidator]),
  });

  isLoading = false;

  constructor(private router: Router) {}

  submit() {
    if (this.form.valid) {
      console.log(this.form.value);
      this.isLoading = true;
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
    }
  }
}
