import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { AlertComponent } from '../alert/alert.component';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, AlertComponent],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {
  private router = inject(Router);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private alertService = inject(AlertService);

  user: User | null = null;

  get isAdmin(): boolean {
    return <boolean>this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    this.userService.getUserSelf().subscribe({
      next: (fetchedUser) => {
        if (!fetchedUser) {
          this.alertService.showAlert('error', 'User not found.');
          this.router.navigate(['/']);
          return;
        }
        this.user = fetchedUser;
      },
      error: () => {
        this.alertService.showAlert('error', 'Failed to load user details. Please try again later.');
      }
    });
  }
}
