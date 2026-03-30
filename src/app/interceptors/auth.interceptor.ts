import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CricketService } from '../services/cricket.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const cricketService = inject(CricketService);
  const token = cricketService.getToken();

  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(cloned);
  }

  return next(req);
};