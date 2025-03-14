import { Component, inject, OnInit } from '@angular/core';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { Employee } from '../../models/employee.model';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../services/alert.service';
import { AlertComponent } from '../shared/alert/alert.component';
import {InputTextComponent} from '../shared/input-text/input-text.component';
import {validations} from '../../models/validation.model';
import {SelectComponent} from '../shared/select/select.component';
import {ButtonComponent} from '../shared/button/button.component';

@Component({
  selector: 'app-edit-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent, InputTextComponent, SelectComponent, ButtonComponent],
  templateUrl: './edit-employee.component.html',
  styleUrls: ['./edit-employee.component.css']
})
export class EditEmployeeComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private alertService = inject(AlertService);

  employeeId!: number;
  employee: Employee | null = null;
  editForm!: FormGroup;
  loading = true;
  updatingAdminStatus = false;

  get isAdmin(): boolean {
    return <boolean>this.authService.isAdmin();
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam || isNaN(+idParam)) {
      this.alertService.showAlert('error', 'Invalid employee ID.');
      this.router.navigate(['/employees']);
      return;
    }

    this.employeeId = +idParam;
    this.loadEmployee();
  }

  loadEmployee(): void {
    this.employeeService.getEmployeeById(this.employeeId).subscribe({
      next: (fetchedEmployee) => {
        if (!fetchedEmployee) {
          this.alertService.showAlert('error', 'Employee not found.');
          this.router.navigate(['/employees']);
          return;
        }
        this.employee = fetchedEmployee;
        this.initForm();
      },
      error: () => {
        this.alertService.showAlert('error', 'Failed to load employee details.');
      },
      complete: () => (this.loading = false),
    });
  }

  initForm(): void {
    if (!this.employee) return;

    this.editForm = this.fb.group({
      firstName: [{ value: this.employee.firstName, disabled: true }, Validators.required],
      lastName: [this.employee.lastName, [Validators.required, Validators.minLength(2)]],
      birthDate: [{ value: this.formatDate(this.employee.birthDate), disabled: true }, Validators.required],
      gender: [this.employee.gender, [Validators.required, Validators.minLength(1), Validators.maxLength(1)]],
      jmbg: [{ value: this.employee.jmbg, disabled: true }, Validators.required],
      email: [{ value: this.employee.email, disabled: true }, [Validators.required, Validators.email]],
      phone: [this.employee.phone, [Validators.required, Validators.pattern(/^0?[1-9][0-9]{6,14}$/)]],
      address: [this.employee.address, [Validators.required, Validators.minLength(5)]],
      position: [this.employee.position, [Validators.required]],
      department: [this.employee.department, [Validators.required]],
    });
  }

  saveChanges(): void {
    if (!this.isAdmin) {
      this.alertService.showAlert('error', 'Only admins can update employee details.');
      return;
    }

    if (this.editForm.invalid) {
      this.alertService.showAlert('warning', 'Please correct errors before submitting.');
      this.editForm.markAllAsTouched();
      return;
    }

    const updatedEmployee: Partial<Employee> = {
      lastName: this.editForm.value.lastName,
      gender: this.editForm.value.gender,
      phone: this.editForm.value.phone,
      address: this.editForm.value.address,
      position: this.editForm.value.position,
      department: this.editForm.value.department,
    };

    this.employeeService.updateEmployee(this.employeeId, updatedEmployee).subscribe({
      next: () => {
        this.alertService.showAlert('success', 'Employee updated successfully!');
        this.router.navigate(['/employees']);
      },
      error: () => {
        this.alertService.showAlert('error', 'Failed to update employee.');
      },
    });
  }

  toggleAdminStatus(): void {
    if (!this.employee || !this.isAdmin) return;

    this.updatingAdminStatus = true;
    const newRole = this.employee.role === 'ADMIN' ? 'EMPLOYEE' : 'ADMIN';

    this.employeeService.setEmployeeRole(this.employee.id, newRole).subscribe({
      next: () => {
        this.employee!.role = newRole;
        this.alertService.showAlert('success', `Employee is now an ${newRole.toUpperCase()}.`);
      },
      error: () => {
        this.alertService.showAlert('error', 'Failed to update employee role.');
      },
      complete: () => (this.updatingAdminStatus = false),
    });
  }

  private formatDate(date?: Date): string {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  }

  protected readonly validations = validations;
}
