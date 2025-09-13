import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../../services/dashboard';
import { NotificationService } from '../../../services/notification';
import { DashboardStats, ChartData } from '../../../models/dashboard-stats';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './analytics-dashboard.html',
  styleUrl: './analytics-dashboard.css'
})
export class AnalyticsDashboard implements OnInit {
  // Dashboard data
  dashboardStats: DashboardStats | null = null;
  isLoading = true;
  error: string | null = null;

  // Chart data
  booksChartData: ChartData | null = null;
  membersChartData: ChartData | null = null;
  complaintsChartData: ChartData | null = null;

  // Selected time period for analytics
  selectedPeriod = 'monthly';
  periodOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  // Key metrics (derived from dashboard stats)
  keyMetrics = {
    libraryUtilization: 0,
    memberGrowth: 0,
    bookTurnover: 0,
    avgBorrowingTime: 0
  };

  constructor(
    private dashboardService: DashboardService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAnalyticsData();
    this.loadChartData();
  }

  // Load main analytics data
  private loadAnalyticsData() {
    this.isLoading = true;
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
        this.calculateKeyMetrics();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading analytics data:', error);
        this.error = 'Unable to load analytics data. Connect backend to view analytics.';
        this.isLoading = false;
      }
    });
  }

  // Load chart data
  private loadChartData() {
    // Load books chart data
    this.dashboardService.getBooksChartData(this.selectedPeriod as 'daily' | 'weekly' | 'monthly').subscribe({
      next: (data: any) => {
        this.booksChartData = data;
      },
      error: (error: any) => {
        console.error('Error loading books chart data:', error);
      }
    });

    // Load members chart data  
    this.dashboardService.getMembersChartData(this.selectedPeriod as 'daily' | 'weekly' | 'monthly').subscribe({
      next: (data: any) => {
        this.membersChartData = data;
      },
      error: (error: any) => {
        console.error('Error loading members chart data:', error);
      }
    });

    // Load complaints chart data
    this.dashboardService.getComplaintsChartData(this.selectedPeriod as 'daily' | 'weekly' | 'monthly').subscribe({
      next: (data: any) => {
        this.complaintsChartData = data;
      },
      error: (error: any) => {
        console.error('Error loading complaints chart data:', error);
      }
    });
  }

  // Calculate key metrics from dashboard stats
  private calculateKeyMetrics() {
    if (!this.dashboardStats) {
      this.keyMetrics = {
        libraryUtilization: 0,
        memberGrowth: 0,
        bookTurnover: 0,
        avgBorrowingTime: 0
      };
      return;
    }

    // Calculate real metrics based on dashboard stats
    const totalBooks = this.dashboardStats.totalBooks || 0;
    const borrowedBooks = this.dashboardStats.totalBorrowedBooks || 0;
    const totalMembers = this.dashboardStats.totalMembers || 0;
    const newMembers = this.dashboardStats.monthlyStats?.newMembers || 0;

    this.keyMetrics = {
      libraryUtilization: totalBooks > 0 ? Math.round((borrowedBooks / totalBooks) * 100) : 0,
      memberGrowth: totalMembers > 0 ? Math.round((newMembers / totalMembers) * 100) : 0,
      bookTurnover: Math.round(borrowedBooks * 1.2), // Estimated turnover
      avgBorrowingTime: 14 // Estimated 14 days average
    };
  }

  // Handle period change
  onPeriodChange() {
    this.loadChartData();
  }

  // ✅ CORE NAVIGATION ONLY (matching user stories)
  navigateToDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }

  navigateToBooks() {
    this.router.navigate(['/admin/books']);
  }

  navigateToMembers() {
    this.router.navigate(['/admin/members']);
  }

  navigateToComplaints() {
    this.router.navigate(['/admin/complaints']);
  }

  // Utility methods
  formatPercentage(value: number): string {
    return `${value}%`;
  }

  formatNumber(value: number): string {
    return value.toLocaleString('en-IN');
  }

  refreshAnalytics() {
    this.loadAnalyticsData();
    this.loadChartData();
    this.notificationService.showSuccess('Analytics data refreshed');
  }
}
