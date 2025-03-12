import { Component, OnInit, inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { AlertComponent } from '../shared/alert/alert.component';
import { PaginationComponent } from '../shared/pagination/pagination.component';

@Component({
  selector: 'app-users',
  standalone: true,
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  imports: [CommonModule, AlertComponent, PaginationComponent],
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private alertService = inject(AlertService);

  users: User[] = [];
  pagedUsers: User[] = [];
  filteredUsers: User[] = [];

  currentPage: number = 1;
  pageSize: number = 10;

  get isAdmin(): boolean {
    return <boolean>this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.userService.getAllUsers(0, 100).subscribe({
      next: (data) => {
        this.users = data.content;
        this.filteredUsers = [...this.users];
        this.updatePagedUsers();
      },
      error: () => {
        this.alertService.showAlert('error', 'Failed to load users. Please try again later.');
      },
    });
  }

  updatePagedUsers(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.pagedUsers = this.filteredUsers.slice(startIndex, startIndex + this.pageSize);
  }

  onPageChanged(page: number): void {
    this.currentPage = page < 1 ? 1 : page;
    this.updatePagedUsers();
  }

  deleteUser(userId: number): void {
    if (!this.isAdmin) {
      this.alertService.showAlert('error', 'Only admins can delete users.');
      return;
    }

    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.filteredUsers = this.filteredUsers.filter((u) => u.id !== userId);
          this.updatePagedUsers();
          this.alertService.showAlert('success', 'User deleted successfully.');
        },
        error: () => {
          this.alertService.showAlert('error', 'Failed to delete user. Please try again.');
        },
      });
    }
  }

  editUser(userId: number): void {
    this.router.navigate(['/users', userId]);
  }

  registerUser() {
    this.router.navigate(['/register-user']);
  }
}
