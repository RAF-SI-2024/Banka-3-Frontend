import { Component, OnInit, inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model'; // Ispravan User model
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../services/alert.service';
import { AlertComponent } from '../alert/alert.component';
import {PaginationComponent} from '../pagination/pagination.component';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-client-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AlertComponent, PaginationComponent],
  templateUrl: './client-portal.component.html',
  styleUrls: ['./client-portal.component.css'],
})
export class ClientPortalComponent implements OnInit {
  private userService = inject(UserService);
  private alertService = inject(AlertService);
  private authService = inject(AuthService);

  clients: User[] = [];
  filteredClients: User[] = [];
  pagedClients: User[] = [];
  filter = {
    name: '',
    surname: '',
    email: ''
  };
  currentPage = 1;
  pageSize = 10;

  ngOnInit(): void {
    this.loadClients();
  }
  get isAdmin(): boolean {
    return <boolean>this.authService.isAdmin();
  }

  get isEmployee(): boolean {
    return <boolean>this.authService.isEmployee();
  }

  loadClients(): void {
    this.userService.getAllUsers(0, 100).subscribe({
      next: (response) => {
        this.clients = response.content;
        // console.log(response);
        this.filteredClients = [...this.clients];
        this.updatePagedClients();
      },
      error: () => {
        this.alertService.showAlert("error", "Failed to load users.");
      }
    });
  }

  filterClients(): void {
    this.filteredClients = this.clients.filter(client =>
      (this.filter.name ? client.firstName.toLowerCase().includes(this.filter.name) : true) &&
      (this.filter.surname ? client.lastName.toLowerCase().includes(this.filter.surname) : true) &&
      (this.filter.email ? client.email.toLowerCase().includes(this.filter.email) : true)
    );
    this.currentPage = 1;
    this.updatePagedClients();
  }

  updatePagedClients(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedClients = this.filteredClients.slice(startIndex, endIndex);
  }

  onPageChanged(page: number): void {
    this.currentPage = page;
    this.updatePagedClients();
  }

  deleteUser(userId: number): void {
    if (!this.isAdmin) {
      this.alertService.showAlert('error', 'Only admins can delete users.');
      return;
    }

    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.clients = this.clients.filter((u) => u.id !== userId);
          this.alertService.showAlert('success', 'User deleted successfully.');
        },
        error: () => {
          this.alertService.showAlert('error', 'Failed to delete user. Please try again.');
        },
      });
    }
  }

}
