import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SuccessComponent } from '../success/success.component';
import {ButtonComponent} from '../shared/button/button.component';
import {InputTextComponent} from '../shared/input-text/input-text.component';

@Component({
  selector: 'app-mail',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, SuccessComponent, ButtonComponent, InputTextComponent],
  templateUrl: './mail.component.html',
  styleUrls: ['./mail.component.css']
})
export class MailComponent {
  emailForm: FormGroup;
  success: boolean = false;
  loading: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const email = this.emailForm.get('email')?.value;

    this.authService.requestPasswordReset(email).subscribe({
      next: () => {
        this.success = true;
      },
      error: (err) => {
        alert('Invalid email. Please try again.');
        console.error('Error requesting password reset:', err);
      },
      complete: () => (this.loading = false)
    });
  }
}
