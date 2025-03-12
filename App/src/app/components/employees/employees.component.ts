import { Component, inject, OnInit } from '@angular/core';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { Employee } from '../../models/employee.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../services/alert.service';
import { AlertComponent } from '../shared/alert/alert.component';
import { PaginationComponent } from '../shared/pagination/pagination.component';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertComponent, PaginationComponent],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private alertService = inject(AlertService);

  employees: Employee[] = [];
  pagedEmployees: Employee[] = [];
  filteredEmployees: Employee[] = [];

  showDeleteModal = false;
  selectedEmployee: Employee | null = null;

  currentPage: number = 1;
  pageSize: number = 10;

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  ngOnInit(): void {
    if (!this.isAdmin) {
      this.alertService.showAlert("error", "You are not authorized to view this page.");
      return;
    }
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.getEmployees(0, 100).subscribe({
      next: (response) => {
        this.employees = response.content;
        this.filteredEmployees = [...this.employees]; // Kopija liste za paginaciju
        this.updatePagedEmployees();
      },
      error: () => {
        this.alertService.showAlert('error', 'Failed to load employees. Please try again later.');
        this.employees = [];
      }
    });
  }

  updatePagedEmployees(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.pagedEmployees = this.filteredEmployees.slice(startIndex, startIndex + this.pageSize);
  }

  onPageChanged(page: number): void {
    this.currentPage = page;
    this.updatePagedEmployees();
  }

  openDeleteModal(employee: Employee): void {
    this.selectedEmployee = employee;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.selectedEmployee = null;
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    if (!this.isAdmin) {
      this.alertService.showAlert("error", "You are not authorized to delete employees.");
      return;
    }

    if (this.selectedEmployee) {
      this.employeeService.deleteEmployee(this.selectedEmployee.id).subscribe({
        next: () => {
          this.alertService.showAlert("success", "Employee deleted successfully.");
          this.loadEmployees();
          this.closeDeleteModal();
        },
        error: () => {
          this.alertService.showAlert('error', 'Failed to delete employee. Please try again.');
        }
      });
    }
  }

  register() {
    this.router.navigate(['/register-employee']);
  }

  deactivateEmployee(id: number): void {
    if (!this.isAdmin) {
      this.alertService.showAlert("error", "You are not authorized to deactivate employees.");
      return;
    }

    this.employeeService.deactivateEmployee(id).subscribe({
      next: () => {
        const employee = this.employees.find(emp => emp.id === id);
        if (employee) {
          employee.active = false;
        }
        this.alertService.showAlert("success", "Employee deactivated successfully.");
      },
      error: () => {
        this.alertService.showAlert('error', 'Failed to deactivate employee. Please try again.');
      }
    });
  }

  viewEmployeeDetails(id: number): void {
    this.router.navigate(['/employees', id]);
  }
}
