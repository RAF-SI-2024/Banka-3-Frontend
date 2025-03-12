import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import {validations} from '../../models/validation.model';
import {InputTextComponent} from '../shared/input-text/input-text.component';
import {SelectComponent} from '../shared/select/select.component';
import {ButtonComponent} from '../shared/button/button.component';

@Component({
  selector: 'app-register-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextComponent, SelectComponent, ButtonComponent],
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
      firstName: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/), Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/), Validators.minLength(2)]],
      birthDate: ['', [Validators.required, Validators.max(new Date().getDate())]],
      gender: ['', [Validators.required]],
      jmbg: ['', [Validators.required, Validators.pattern(/^\d{13}$/)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^0?[1-9][0-9]{6,14}$/)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      position: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/), Validators.minLength(2)]],
      department: ['', [Validators.required, Validators.minLength(2)]],
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
      console.log(this.registerEmployeeForm.value);
      this.registerEmployeeForm.markAllAsTouched();
    }
  }

  protected readonly validations = validations;
}
