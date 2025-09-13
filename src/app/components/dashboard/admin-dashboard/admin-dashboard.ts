import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../../services/dashboard';
import { AuthService } from '../../../services/auth';
import { NotificationService } from '../../../services/notification';
import { DashboardStats, RecentActivity } from '../../../models/dashboard-stats';
import { Admin } from '../../../models/admin';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  dashboardStats: DashboardStats | null = null;
  recentActivities: RecentActivity[] = [];
  currentAdmin: Admin | null = null;
  isLoading = true;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentAdmin = this.authService.getCurrentAdmin();
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;
    
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
        this.recentActivities = stats.recentActivities || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.notificationService.showError('Failed to load dashboard data');
        this.isLoading = false;
      }
    });
  }

  refreshData() {
    this.loadDashboardData();
    this.notificationService.showSuccess('Dashboard data refreshed');
  }

  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'Book Added': 'fas fa-book',
      'Member Registered': 'fas fa-user-plus',
      'Book Borrowed': 'fas fa-book-reader',
      'Book Returned': 'fas fa-undo',
      'Complaint Filed': 'fas fa-exclamation-triangle',
      'Fine Paid': 'fas fa-credit-card'
    };
    return icons[type] || 'fas fa-circle';
  }

  getActivityIconClass(type: string): string {
    const classes: { [key: string]: string } = {
      'Book Added': 'bg-primary',
      'Member Registered': 'bg-success',
      'Book Borrowed': 'bg-info',
      'Book Returned': 'bg-warning',
      'Complaint Filed': 'bg-danger',
      'Fine Paid': 'bg-secondary'
    };
    return classes[type] || 'bg-light';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  navigateToBooks() {
    this.router.navigate(['/admin/books']);
  }

  navigateToMembers() {
    this.router.navigate(['/admin/members']);  
  }

  navigateToDonations() {
    this.router.navigate(['/admin/donations']);
  }

  // For future complaint integration
  navigateToComplaints() {
    this.router.navigate(['/admin/complaints']);
  }

  // Navigation to specific filtered views
  navigateToBookManagement() {
    this.router.navigate(['/admin/books/add']);
  }

  navigateToMemberSearch() {
    this.router.navigate(['/admin/members/search']);
  }

  navigateToPendingDonations() {
    this.router.navigate(['/admin/donations'], { queryParams: { status: 'Pending' } });
  }
}
