import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const securitiesGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    if (authService.isClient() || authService.isActuary()) {
      return true;
    } else {
      router.navigate(['/']);
      return false;
    }
  } else {
    router.navigate(['/login']);
    return false;
  }
};