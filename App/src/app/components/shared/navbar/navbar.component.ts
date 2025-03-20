import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import {ModalComponent} from '../modal/modal.component';
import {AsideComponent} from '../aside/aside.component';
import {DropdownComponent} from '../dropdown/dropdown.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, ModalComponent, AsideComponent, DropdownComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isDropdownOpen: boolean = false;
  isSidebarOpen: boolean = false;

  protected router = inject(Router);
  protected authService = inject(AuthService);

  isAuthenticated = false;
  isAdmin = false;
  isEmployee = false;
  isClient = false;
  userId: number | null = null;
  private authSubscription!: Subscription; // Subscription to track auth changes

  isModalOpen: boolean = false;
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

  openModal() {
    this.isModalOpen = true;
  }
  closeModal() {
    this.isModalOpen = false;
  }
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
  navigateTo(route: string) {
    this.closeModal();
    this.router.navigate([route]);
  }


  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  getUserName() {
    return this.authService.getUserName();
  }
}
