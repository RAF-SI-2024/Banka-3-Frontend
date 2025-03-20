import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SuccessComponent } from '../success/success.component';
import { AlertService } from '../../services/alert.service';
import {AlertComponent} from '../shared/alert/alert.component';
import {InputTextComponent} from '../shared/input-text/input-text.component';
import {ButtonComponent} from '../shared/button/button.component';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, SuccessComponent, AlertComponent, InputTextComponent, ButtonComponent],
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.css']
})
export class PasswordResetComponent {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private alertService = inject(AlertService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  passwordForm: FormGroup;
  emailForm: FormGroup;
  passwordFeedback: string = '';
  success: boolean = false;
  emailSubmitted: boolean = false;
  loading: boolean = false;
  token: string | null = '';

  constructor() {
    this.token = this.route.snapshot.paramMap.get('token');

    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, this.passwordStrengthValidator.bind(this)]],
        repeatNewPassword: ['', [Validators.required]]
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  requestPasswordReset() {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const email = this.emailForm.get('email')?.value;

    this.authService.requestPasswordReset(email).subscribe({
      next: () => {
        this.emailSubmitted = true;
        this.alertService.showAlert('success', 'Password reset request sent successfully.');
      },
      error: () => {
        this.alertService.showAlert('error', 'Invalid email. Please try again.');
      },
      complete: () => (this.loading = false)
    });
  }

  passwordsMatchValidator(form: FormGroup): ValidationErrors | null {
    const password = form.get('newPassword')?.value;
    const confirmPassword = form.get('repeatNewPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;

    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const lengthValid = password.length >= 8;

    let missingElements = [];
    if (!lengthValid) missingElements.push('at least 8 characters');
    if (!hasLetters) missingElements.push('at least one letter');
    if (!hasNumbers) missingElements.push('at least one number');
    if (!hasSpecial) missingElements.push('at least one special character');

    if (missingElements.length > 0) {
      this.passwordFeedback = 'Password must contain: ' + missingElements.join(', ');
      return { weakPassword: true };
    }

    this.passwordFeedback = 'Strong password!';
    return null;
  }

  onSubmit() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const newPassword = this.passwordForm.get('newPassword')?.value;

    this.authService.resetPassword(this.token, newPassword).subscribe({
      next: () => {
        this.success = true;
        this.alertService.showAlert('success', 'Your password has been successfully reset.');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: () => {
        this.alertService.showAlert('error', 'Error resetting password. Please try again.');
      }
    });
  }
}
