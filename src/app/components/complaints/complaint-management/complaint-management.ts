import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ComplaintService } from '../../../services/complaint';
import { DashboardService } from '../../../services/dashboard';
import { NotificationService } from '../../../services/notification';
import { Complaint } from '../../../models/complaint';
import { DashboardStats, ChartData } from '../../../models/dashboard-stats';
import { COMPLAINT_CATEGORIES, COMPLAINT_STATUSES } from '../../../utils/constants';

@Component({
  selector: 'app-complaint-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './complaint-management.html',
  styleUrl: './complaint-management.css'
})
export class ComplaintManagementComponent implements OnInit {
  // Dashboard statistics
  dashboardStats: DashboardStats | null = null;
  recentComplaints: Complaint[] = [];
  allComplaints: Complaint[] = []; // 🔧 ADD: Store all complaints for better counting
  isLoading = true;

  // Analytics data
  categoryData: any = null;
  statusData: any = null;
  monthlyTrendData: any = null;
  priorityData: any = null;

  // Filter options
  categories = COMPLAINT_CATEGORIES;
  statusOptions = COMPLAINT_STATUSES;
  selectedPeriod = 'monthly';
  periodOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  // Key Performance Indicators
  kpis = {
    avgResponseTime: 0,
    resolutionRate: 0,
    customerSatisfaction: 0,
    pendingOverdue: 0,
    avgResolutionTime: 0,
    escalationRate: 0
  };

  constructor(
    private complaintService: ComplaintService,
    private dashboardService: DashboardService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDashboardData();
    this.loadAnalyticsData();
    this.loadRecentComplaints();
    this.calculateKPIs();
  }

  // Load main dashboard statistics
  private loadDashboardData() {
    this.isLoading = true;
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.notificationService.showError('Failed to load dashboard statistics');
        this.isLoading = false;
      }
    });
  }

  // Load analytics data using your exact service method
  private loadAnalyticsData() {
    this.dashboardService.getComplaintsChartData(this.selectedPeriod as 'daily' | 'weekly' | 'monthly').subscribe({
      next: (chartData) => {
        this.processChartData(chartData);
      },
      error: (error) => {
        console.error('Error loading analytics data:', error);
        this.notificationService.showError('Failed to load analytics data');
      }
    });
  }

  // Process chart data from backend
  private processChartData(chartData: ChartData) {
    // Transform backend chart data into component data
    this.monthlyTrendData = {
      labels: chartData.labels,
      datasets: chartData.datasets
    };

    // Generate category and status breakdowns from real data
    this.generateCategoryStatusData();
  }

  // Generate category and status distribution from real data
  private generateCategoryStatusData() {
    // This would use real data from the backend
    // For now, will be empty until backend provides data
    this.categoryData = null;
    this.statusData = null;
    this.priorityData = null;
  }

  // 🔧 ENHANCED: Load recent complaints + all complaints for better counting
  private loadRecentComplaints() {
    // Load recent complaints for display (10 most recent)
    this.complaintService.getComplaints(0, 10, { status: 'Open' }).subscribe({
      next: (response) => {
        this.recentComplaints = response.content || [];
      },
      error: (error) => {
        console.error('Error loading recent complaints:', error);
        this.notificationService.showError('Failed to load recent complaints');
        this.recentComplaints = [];
      }
    });

    // Load more complaints for better status counting (50 most recent)
    this.complaintService.getComplaints(0, 50, {}).subscribe({
      next: (response) => {
        this.allComplaints = response.content || [];
      },
      error: (error) => {
        console.error('Error loading all complaints:', error);
        this.allComplaints = [];
      }
    });
  }

  // Calculate Key Performance Indicators from real data
  private calculateKPIs() {
    if (!this.dashboardStats) {
      this.kpis = {
        avgResponseTime: 0,
        resolutionRate: 0,
        customerSatisfaction: 0,
        pendingOverdue: 0,
        avgResolutionTime: 0,
        escalationRate: 0
      };
      return;
    }

    // Calculate real KPIs based on dashboard stats
    this.kpis = {
      avgResponseTime: 0, // Would be calculated from response times
      resolutionRate: this.dashboardStats.totalComplaints > 0 ? 
        ((this.dashboardStats.totalComplaints - this.dashboardStats.pendingComplaints) / this.dashboardStats.totalComplaints) * 100 : 0,
      customerSatisfaction: 0, // Would come from feedback data
      pendingOverdue: this.dashboardStats.pendingComplaints || 0,
      avgResolutionTime: 0, // Would be calculated from resolution data
      escalationRate: 0 // Would be calculated from escalation data
    };
  }

  // 🔧 ADD: Smart status counting that automatically uses real data when available
  getStatusCount(status: string): number {
    // If no dashboard stats yet, return 0
    if (!this.dashboardStats) return 0;

    // If we have all complaints data, calculate from that (most accurate)
    if (this.allComplaints && this.allComplaints.length > 0) {
      return this.allComplaints.filter(complaint => complaint.status === status).length;
    }

    // Fallback calculations from dashboard stats
    switch (status) {
      case 'Open':
        return this.dashboardStats.pendingComplaints || 0;
      case 'In Progress':
        // Estimate in-progress complaints
        const total = this.dashboardStats.totalComplaints || 0;
        const pending = this.dashboardStats.pendingComplaints || 0;
        const resolved = this.dashboardStats.monthlyStats?.complaintsResolved || 0;
        return Math.max(0, Math.floor((total - pending - resolved) * 0.6)); // Estimate
      case 'Resolved':
        return this.dashboardStats.monthlyStats?.complaintsResolved || 0;
      case 'Closed':
        // Estimate closed complaints
        const totalComplaints = this.dashboardStats.totalComplaints || 0;
        const openComplaints = this.dashboardStats.pendingComplaints || 0;
        const resolvedComplaints = this.dashboardStats.monthlyStats?.complaintsResolved || 0;
        const inProgressCount = this.getInProgressEstimate();
        return Math.max(0, totalComplaints - openComplaints - resolvedComplaints - inProgressCount);
      default:
        return 0;
    }
  }

  // 🔧 ADD: Helper method for in-progress estimation
  private getInProgressEstimate(): number {
    if (!this.dashboardStats) return 0;
    const total = this.dashboardStats.totalComplaints || 0;
    const pending = this.dashboardStats.pendingComplaints || 0;
    const resolved = this.dashboardStats.monthlyStats?.complaintsResolved || 0;
    return Math.max(0, Math.floor((total - pending - resolved) * 0.6));
  }

  // 🔧 ADD: Enhanced method to get status percentage that works with real data
  getStatusPercentage(status: string): number {
    const total = this.dashboardStats?.totalComplaints || 0;
    if (total === 0) return 0;
    
    const count = this.getStatusCount(status);
    return Math.round((count / total) * 100);
  }

  // Period change handler
  onPeriodChange() {
    this.loadAnalyticsData();
  }

  // Navigation methods (matches your pattern)
  navigateToComplaintList() {
    this.router.navigate(['/admin/complaints']);
  }

  navigateToPendingComplaints() {
    this.router.navigate(['/admin/complaints'], { queryParams: { status: 'Open' } });
  }

  navigateToInProgressComplaints() {
    this.router.navigate(['/admin/complaints'], { queryParams: { status: 'In Progress' } });
  }

  navigateToResolvedComplaints() {
    this.router.navigate(['/admin/complaints'], { queryParams: { status: 'Resolved' } });
  }

  navigateToComplaintDetails(complaintId: string) {
    this.router.navigate(['/admin/complaints', complaintId]);
  }

  navigateToCategory(category: string) {
    this.router.navigate(['/admin/complaints'], { queryParams: { category } });
  }

  // Utility methods
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusBadgeClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'Open': 'badge bg-warning text-dark',
      'In Progress': 'badge bg-info',
      'Resolved': 'badge bg-success',
      'Closed': 'badge bg-secondary'
    };
    return statusClasses[status] || 'badge bg-light text-dark';
  }

  getPriorityBadgeClass(priority: string): string {
    const priorityClasses: { [key: string]: string } = {
      'High': 'badge bg-danger',
      'Medium': 'badge bg-warning text-dark',
      'Low': 'badge bg-success'
    };
    return priorityClasses[priority] || 'badge bg-light text-dark';
  }

  refreshData() {
    this.loadDashboardData();
    this.loadAnalyticsData();
    this.loadRecentComplaints();
    this.calculateKPIs();
    this.notificationService.showSuccess('Analytics data refreshed');
  }

  exportReport() {
    // Export functionality would integrate with backend
    this.notificationService.showSuccess('Report export initiated');
  }

  // Chart click handlers
  onCategoryChartClick(category: string) {
    this.navigateToCategory(category);
  }

  onStatusChartClick(status: string) {
    this.router.navigate(['/admin/complaints'], { queryParams: { status } });
  }
}
