import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import {InputTextComponent} from '../components/shared/input-text/input-text.component';
import {ButtonComponent} from '../components/shared/button/button.component';
import {validations} from '../models/validation.model';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, InputTextComponent, ButtonComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  errorMessage = '';
  loginType: 'employee' | 'client' = 'employee';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService
) {}

  ngOnInit(): void {
    const loginTypeParam = this.route.snapshot.paramMap.get('type');
    if (loginTypeParam === 'client' || loginTypeParam === 'employee') {
      this.loginType = loginTypeParam;
    }
  }

  login(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Email and password are required!';
      this.alertService.showAlert('error', 'Email and password are required!');
      return;
    }

    this.authService.login(this.email, this.password, this.loginType).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        this.alertService.showAlert('success', 'Login successful!');
        const userId = this.authService.getUserId();
        const permissions = this.authService.getUserPermissions();

        if (this.loginType === 'employee') {
          if (this.authService.isAdmin()) {
            this.router.navigate(['/client-portal']);
          } else {
            this.router.navigate([`/employee/${userId}`]);
          }
        } else {
          this.router.navigate([`/user/${userId}`]);
        }
      },
      error: () => {
        this.errorMessage = 'Invalid email or password';
        this.alertService.showAlert('error', this.errorMessage);
      }
    });
  }

  passwordForgot() {
    this.router.navigate(['/forgot-password']);
  }

  register() {
    this.router.navigate(['/register']);
  }

  protected readonly validations = validations;
}
