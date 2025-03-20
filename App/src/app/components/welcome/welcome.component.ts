import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {ButtonComponent} from '../shared/button/button.component';

@Component({
  selector: 'app-welcome',
  standalone: true,
  templateUrl: './welcome.component.html',
  imports: [
    ButtonComponent
  ],
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent {
  constructor(private router: Router) {}

  selectLogin(userType: 'employee' | 'client'): void {
    this.router.navigate([`/login/${userType}`]); // ✅ Redirect to login with userType
  }
}
