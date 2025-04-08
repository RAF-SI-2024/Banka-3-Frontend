import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ClientService } from '../../../services/client.service';
import { User } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {
  private router = inject(Router);
  private userService = inject(ClientService);
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
        console.log(this.user)
        console.log(fetchedUser)
        this.user = fetchedUser;
      },
      error: () => {
        this.alertService.showAlert('error', 'Failed to load user details. Please try again later.');
      }
    });
  }
}
