import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {ButtonComponent} from '../shared/button/button.component';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  standalone: true,
  imports: [
    ButtonComponent
  ],
  styleUrl: './success.component.css'
})
export class SuccessComponent {
  title: string = 'Success!';
  message: string = 'Operation successful!';
  buttonName: string = 'Continue';
  continuePath: string = '/';

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.title = navigation.extras.state['title'] || this.title;
      this.message = navigation.extras.state['message'] || this.message;
      this.buttonName = navigation.extras.state['buttonName'] || this.buttonName;
      this.continuePath = navigation.extras.state['continuePath'] || this.continuePath;
    }
  }

  onContinue(): void {
    this.router.navigate([this.continuePath]);
  }
}
