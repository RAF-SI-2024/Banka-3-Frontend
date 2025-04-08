import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const supervisorGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.isAuthenticated() && (authService.isSupervisor() || authService.isAdmin())) {
    return true;
  }

  return router.parseUrl('/login');
}
