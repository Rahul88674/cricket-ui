import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CricketService } from '../services/cricket.service';

export const authGuard: CanActivateFn = (route, state) => {
  const cricketService = inject(CricketService);
  const router = inject(Router);

  if (cricketService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};