import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';
import { NotificationService } from '../services/notification';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);
  
  const token = authService.getToken();
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError(error => {
      if (error.status === 401) {
        authService.logout();
        notificationService.showError('Session expired. Please login again.');
      } else if (error.status === 403) {
        notificationService.showError('Access denied. Insufficient permissions.');
      } else if (error.status === 0) {
        notificationService.showError('Network error. Please check your connection.');
      }
      return throwError(() => error);
    })
  );
};
