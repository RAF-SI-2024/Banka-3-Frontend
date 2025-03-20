import { Component, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [NgClass, NgIf, ModalComponent, RouterLink],
  templateUrl: './aside.component.html',
  styleUrl: './aside.component.css'
})
export class AsideComponent implements OnInit, OnDestroy {
  @Input() isSidebarOpen: boolean = false;
  protected router = inject(Router);
  protected authService = inject(AuthService);

  isAuthenticated = false;
  isAdmin = false;
  isEmployee = false;
  isClient = false;
  userId: number | null = null;
  private authSubscription!: Subscription;
  isModalOpen: boolean = false;
  isAccountModalOpen: boolean = false;

  ngOnInit(): void {
    this.authSubscription = this.authService.authStatus$.subscribe((isAuth) => {
      this.isAuthenticated = isAuth;
      if (this.isAuthenticated) {
        this.isAdmin = this.authService.isAdmin();
        this.isEmployee = this.authService.isEmployee();
        this.isClient = this.authService.isClient();
        this.userId = this.authService.getUserId();
      } else {
        this.isAdmin = false;
        this.isEmployee = false;
        this.isClient = false;
        this.userId = null;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  openAccountModal() {
    this.isAccountModalOpen = true;
  }

  closeAccountModal() {
    this.isAccountModalOpen = false;
  }

  navigateTo(route: string) {
    this.closeModal();
    this.router.navigate([route]);
  }

  goToClientPortalOrUserDetail() {
    if (this.isClient && this.userId) {
      this.navigateTo(`/user/${this.userId}`);
    } else {
      this.navigateTo('/client-portal');
    }
  }

  goToAccountManagement() {
    this.navigateTo(`/account-management`);
  }

  goToPaymentsOrEmployees(){
    if (this.isClient) {
      this.openModal()
    } else {
      this.navigateTo('/employees');
    }
  }

  goToExchangeRate() {
    this.navigateTo('/exchange-rate');
  }

  goToLoans() {
    if (this.isClient) {
      this.navigateTo(`/loan-management/${this.userId}`);
    } else {
      this.navigateTo('/loan-management'); // todo
    }
  }

  goToSecures() {
    this.navigateTo('/my-portfolio');
  }
}
