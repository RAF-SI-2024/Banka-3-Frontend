import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../services/client.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { User } from '../../models/user.model';
import { AlertComponent } from '../shared/alert/alert.component';
import {InputTextComponent} from '../shared/input-text/input-text.component';
import {SelectComponent} from '../shared/select/select.component';
import {ButtonComponent} from '../shared/button/button.component';

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent, InputTextComponent, SelectComponent, ButtonComponent],
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.css'],
})
export class RegisterUserComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private userService = inject(ClientService);
  private authService = inject(AuthService);
  private alertService = inject(AlertService);
  private route = inject(ActivatedRoute);

  registerUserForm!: FormGroup;
  loading = false;
  redirectToAccountCreation = false;

  redirectTarget = '';

  get isAdmin(): boolean {
    return <boolean>this.authService.isAdmin();
  }
  get isEmployee(): boolean {
    return <boolean> this.authService.isEmployee();
  }

  ngOnInit(): void {
    if (!(this.isAdmin || this.isEmployee)) {
      this.alertService.showAlert('error', 'You do not have permission to register users.');
      this.router.navigate(['/']);
      return;
    }
    this.route.queryParams.subscribe(params => {
      this.redirectTarget = params['redirect'] || '';
    });
    // this.route.queryParams.subscribe(params => {
    //   if (params['redirect'] === 'account') {
    //     this.redirectToAccountCreation = true;
    //   }
    // });

    this.initForm();
  }

  initForm(): void {
    this.registerUserForm = this.fb.group({
      firstName: ['', [Validators.required, this.onlyLettersValidator, Validators.minLength(2)]],
      lastName: ['', [Validators.required, this.onlyLettersValidator, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(4)]],
      birthDate: ['', [Validators.required, this.pastDateValidator]],
      gender: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^0?[1-9][0-9]{6,14}$/)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      jmbg: ['', [Validators.required, Validators.pattern(/^[0-9]{13}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['user', Validators.required],
    });
  }

  onSubmit(): void {
    if (!(this.isAdmin || this.isEmployee)) {
      this.alertService.showAlert('error', 'Only admins can register users.');
      return;
    }

    if (this.registerUserForm.invalid) {
      this.alertService.showAlert('warning', 'Please correct errors before submitting.');
      this.registerUserForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formData = this.registerUserForm.value;

    this.userService.registerUser(formData).subscribe({
      next: (newUser: User) => {
        this.alertService.showAlert('success', 'User registered successfully!');

        if (this.redirectTarget) {
          switch(this.redirectTarget) {
            case 'current-account':
              this.router.navigate(['/create-current-account'], {
                queryParams: { userId: newUser.id }
              });
              break;
            case 'foreign-account':
              this.router.navigate(['/create-foreign-currency-account'], {
                queryParams: { userId: newUser.id }
              });
              break;
            default:
              this.router.navigate(['/client-portal']);
          }
        } else {
          this.router.navigate(['/client-portal']);
        }
      },
      error: (err) => {
        this.alertService.showAlert('error', err?.error?.message || 'Failed to register user. Please try again.');
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  onlyLettersValidator(control: AbstractControl): ValidationErrors | null {
    return /^[A-Za-z\s]+$/.test(control.value.trim()) ? null : { onlyLetters: true };
  }

  pastDateValidator(control: AbstractControl): ValidationErrors | null {
    const today = new Date();
    const inputDate = new Date(control.value);
    return inputDate < today ? null : { invalidDate: 'Birthdate must be in the past' };
  }

  hasError(controlName: string, errorCode: string): boolean {
    const control = this.registerUserForm?.get(controlName);
    return !!(control && control.hasError(errorCode));
  }
}
