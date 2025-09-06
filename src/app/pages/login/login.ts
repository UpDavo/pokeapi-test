import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth.service';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CardModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    ButtonModule,
    MessageModule,
  ],
  templateUrl: './login.html',
})
export class Login {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
    remember: new FormControl(false),
  });

  errorMessage = '';

  constructor(private auth: Auth, private router: Router) {}

  submit() {
    if (this.form.valid) {
      const { email, password, remember } = this.form.value;
      const success = this.auth.login(email!, password!, remember!);

      if (success) {
        this.errorMessage = '';
        this.router.navigate(['/']);
      } else {
        this.errorMessage = 'Credenciales inválidas. Intente nuevamente.';
      }
    }
  }
}
