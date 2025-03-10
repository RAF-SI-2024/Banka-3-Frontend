import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  errorMessage = '';
  loginType: 'employee' | 'client' = 'employee';

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const loginTypeParam = this.route.snapshot.paramMap.get('type');
    if (loginTypeParam === 'client' || loginTypeParam === 'employee') {
      this.loginType = loginTypeParam;
    }
  }

  login(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Email and password are required!';
      return;
    }

    this.authService.login(this.email, this.password, this.loginType).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);

        const userId = this.authService.getUserId();
        const permissions = this.authService.getUserPermissions();

        if (this.loginType === 'employee') {
          if (permissions?.includes('ADMIN')) {
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
      }
    });
  }

  passwordForgot() {
    this.router.navigate(['/forgot-password']);
  }

  register() {
    this.router.navigate(['/register']);
  }
}
