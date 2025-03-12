import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { AlertComponent } from '../alert/alert.component';

@Component({
  selector: 'app-register-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent],
  templateUrl: './register-employee.component.html',
  styleUrls: ['./register-employee.component.css']
})
export class RegisterEmployeeComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);
  private alertService = inject(AlertService);

  registerEmployeeForm!: FormGroup;

  get isAdmin(): boolean {
    return <boolean>this.authService.isAdmin();
  }

  ngOnInit(): void {
    if (!this.isAdmin) {
      this.alertService.showAlert('error', 'You are not authorized to register employees.');
      return;
    }

    this.registerEmployeeForm = this.fb.group({
      firstName: ['', [Validators.required, this.onlyLettersValidator, this.minLengthWithoutSpaces(2)]],
      lastName: ['', [Validators.required, this.onlyLettersValidator, this.minLengthWithoutSpaces(2)]],
      birthDate: ['', [Validators.required, this.pastDateValidator]],
      gender: ['', [Validators.required]],
      jmbg: ['', [Validators.required, Validators.pattern(/^\d{13}$/)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^0?[1-9][0-9]{6,14}$/)]],
      address: ['', [Validators.required, this.minLengthWithoutSpaces(5)]],
      username: ['', [Validators.required, this.minLengthWithoutSpaces(3)]],
      position: ['', [Validators.required, this.onlyLettersValidator, this.minLengthWithoutSpaces(2)]],
      department: ['', [Validators.required, this.minLengthWithoutSpaces(2)]],
      active: [false, Validators.required]
    });
  }

  onSubmit(): void {
    if (!this.isAdmin) {
      this.alertService.showAlert('error', 'You do not have permission to register employees.');
      return;
    }

    if (this.registerEmployeeForm.valid) {
      const formData = this.registerEmployeeForm.value;

      this.employeeService.registerEmployee(formData).subscribe({
        next: () => {
          this.alertService.showAlert('success', 'Employee registered successfully!');
          this.router.navigate(['/employees']);
        },
        error: () => {
          this.alertService.showAlert('error', 'Failed to register employee. Please try again.');
        }
      });
    } else {
      this.registerEmployeeForm.markAllAsTouched();
    }
  }

  minLengthWithoutSpaces(minLength: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const trimmedLength = control.value.trim().length;
      return trimmedLength < minLength ? { minLengthWithoutSpaces: { requiredLength: minLength, actualLength: trimmedLength } } : null;
    };
  }

  onlyLettersValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const trimmedValue = control.value.trim();
    return /^[A-Za-z\s]+$/.test(trimmedValue) ? null : { onlyLetters: true };
  }

  pastDateValidator(control: AbstractControl): ValidationErrors | null {
    const today = new Date();
    const inputDate = new Date(control.value);
    return inputDate < today ? null : { invalidDate: 'Birthdate must be in the past' };
  }
}
