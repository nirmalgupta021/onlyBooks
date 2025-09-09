import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private currentNotificationSubject = new BehaviorSubject<Notification | null>(null);
  public currentNotification$ = this.currentNotificationSubject.asObservable();

  constructor() {}

  showSuccess(message: string, duration: number = 3000): void {
    this.showNotification('success', message, duration);
  }

  showError(message: string, duration: number = 5000): void {
    this.showNotification('error', message, duration);
  }

  showWarning(message: string, duration: number = 4000): void {
    this.showNotification('warning', message, duration);
  }

  showInfo(message: string, duration: number = 3000): void {
    this.showNotification('info', message, duration);
  }

  private showNotification(type: Notification['type'], message: string, duration: number): void {
    const notification: Notification = {
      id: this.generateId(),
      type,
      message,
      duration
    };

    this.currentNotificationSubject.next(notification);

    if (duration > 0) {
      setTimeout(() => {
        this.hideNotification();
      }, duration);
    }
  }

  hideNotification(): void {
    this.currentNotificationSubject.next(null);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
