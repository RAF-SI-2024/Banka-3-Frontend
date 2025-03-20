import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { User } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import {AlertComponent} from '../shared/alert/alert.component';
import {InputTextComponent} from '../shared/input-text/input-text.component';
import {SelectComponent} from '../shared/select/select.component';
import {ButtonComponent} from '../shared/button/button.component';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent, InputTextComponent, SelectComponent, ButtonComponent],
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css'],
})
export class EditUserComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(ClientService);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private alertService = inject(AlertService);

  userForm!: FormGroup;
  userId!: number;
  loading = true;

  get isAdmin(): boolean {
    return <boolean>this.authService.isAdmin();
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam || isNaN(+idParam)) {
      this.alertService.showAlert('error', 'Invalid user ID.');
      this.router.navigate(['/users']);
      return;
    }

    this.userId = +idParam;
    this.loadUser();
  }

  loadUser(): void {
    this.loading = true;
    this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        if (!user) {
          this.alertService.showAlert('error', 'User not found.');
          this.router.navigate(['/users']);
          return;
        }
        this.initForm(user);
      },
      error: () => {
        this.alertService.showAlert('error', 'Error loading user. Please try again.');
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }

  initForm(user: User): void {
    this.userForm = this.fb.group({
      firstName: [{ value: user.firstName, disabled: true }, Validators.required],
      lastName: [user.lastName, [Validators.required, Validators.minLength(2)]],
      birthDate: [{ value: this.formatDate(user.birthDate), disabled: true }, Validators.required],
      gender: [ user.gender , Validators.required],
      email: [{ value: user.email, disabled: true }, [Validators.required, Validators.email]],
      phone: [user.phone, [Validators.required, Validators.pattern(/^0?[1-9][0-9]{6,14}$/)]],
      address: [user.address, [Validators.required, Validators.minLength(5)]],
    });
  }

  private formatDate(date?: Date): string {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  }

  saveChanges(): void {
    if (!this.isAdmin) {
      this.alertService.showAlert('error', 'Only admins can update user data.');
      return;
    }

    if (this.userForm.invalid) {
      this.alertService.showAlert('warning', 'Form is invalid. Please fix errors before saving.');
      this.userForm.markAllAsTouched();
      return;
    }

    const updatedUser: Partial<User> = {
      lastName: this.userForm.value.lastName,
      gender: this.userForm.value.gender,
      phone: this.userForm.value.phone,
      address: this.userForm.value.address,
    };

    this.userService.updateUser(this.userId, updatedUser).subscribe({
      next: () => {
        this.alertService.showAlert('success', 'User updated successfully!');
        this.router.navigate(['/users']);
      },
      error: () => {
        this.alertService.showAlert('error', 'Failed to update user. Please try again.');
      },
    });
  }

  hasError(controlName: string, errorCode: string): boolean {
    const control = this.userForm?.get(controlName);
    return !!(control && control.hasError(errorCode));
  }
}
