import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ComplaintService } from '../../../services/complaint';
import { NotificationService } from '../../../services/notification';
import { Complaint, ComplaintUpdate } from '../../../models/complaint';
import { COMPLAINT_CATEGORIES, COMPLAINT_STATUSES } from '../../../utils/constants';
import { PaginationComponent } from '../../shared/pagination/pagination';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-complaint-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PaginationComponent, ConfirmationDialogComponent],
  templateUrl: './complaint-dashboard.html',
  styleUrl: './complaint-dashboard.css'
})
export class ComplaintDashboardComponent implements OnInit {
  complaints: Complaint[] = [];
  isLoading = true;
  error: string | null = null;

  // Pagination (matches your existing pattern)
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  // Search and Filter (using your constants)
  searchTerm = '';
  selectedDateFrom = '';
  selectedDateTo = '';
  selectedCategory = '';
  selectedStatus = '';

  // Filter Options (using your constants)
  categories = COMPLAINT_CATEGORIES;
  statusOptions = COMPLAINT_STATUSES;

  // Statistics
  totalComplaints = 0;
  pendingComplaints = 0;
  inProgressComplaints = 0;
  resolvedComplaints = 0;

  // Modal functionality - ONLY status update (removed assignment)
  showStatusModal = false;
  selectedComplaint: Complaint | null = null;
  selectedStatusUpdate = '';
  isProcessing = false;

  constructor(
    private complaintService: ComplaintService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.handleQueryParams();
    this.loadComplaints();
  }

  // Handle URL query parameters (matches your pattern)
  handleQueryParams() {
    this.route.queryParams.subscribe(params => {
      if (params['status']) this.selectedStatus = params['status'];
      if (params['category']) this.selectedCategory = params['category'];
      if (params['search']) this.searchTerm = params['search'];
    });
  }

  // Load complaints using your exact service method
  loadComplaints() {
    this.isLoading = true;
    this.error = null;
    
    const filters: any = {};
    if (this.selectedStatus) filters.status = this.selectedStatus;
    if (this.selectedCategory) filters.category = this.selectedCategory;
    if (this.selectedDateFrom) filters.dateFrom = this.selectedDateFrom;
    if (this.selectedDateTo) filters.dateTo = this.selectedDateTo;
    if (this.searchTerm) filters.search = this.searchTerm;

    this.complaintService.getComplaints(this.currentPage, this.pageSize, filters).subscribe({
      next: (response) => {
        this.complaints = response.content || [];
        this.totalElements = response.totalElements || 0;
        this.totalPages = response.totalPages || 0;
        this.calculateStatistics();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading complaints:', error);
        this.error = 'Failed to load complaints. Please try again.';
        this.notificationService.showError('Failed to load complaints');
        this.isLoading = false;
      }
    });
  }

  // Calculate statistics (matches your dashboard pattern)
  private calculateStatistics() {
    this.totalComplaints = this.totalElements;
    this.pendingComplaints = this.complaints.filter(c => c.status === 'Open').length;
    this.inProgressComplaints = this.complaints.filter(c => c.status === 'In Progress').length;
    this.resolvedComplaints = this.complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
  }

  // Apply filters (matches your filter pattern)
  applyFilters() {
    this.currentPage = 0;
    this.loadComplaints();
  }

  // Clear all filters (matches your pattern)
  clearFilters() {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.selectedDateFrom = '';
    this.selectedDateTo = '';
    this.currentPage = 0;
    this.router.navigate([], { queryParams: {} });
    this.loadComplaints();
  }

  // REMOVED: Assignment modal methods (openAssignModal, closeAssignModal, confirmAssignment)

  // Open status update modal
  openStatusModal(complaint: Complaint) {
    this.selectedComplaint = complaint;
    this.selectedStatusUpdate = '';
    this.showStatusModal = true;
  }

  // Close status modal
  closeStatusModal() {
    this.showStatusModal = false;
    this.selectedComplaint = null;
    this.selectedStatusUpdate = '';
  }

  // Update complaint status (using your exact service method and model)
  confirmStatusUpdate() {
    if (!this.selectedComplaint || !this.selectedStatusUpdate) return;

    this.isProcessing = true;
    const complaintUpdate: ComplaintUpdate = {
      complaintId: this.selectedComplaint.id,
      status: this.selectedStatusUpdate,
      responseText: `Status updated to ${this.selectedStatusUpdate} by Admin`
    };

    this.complaintService.updateComplaintStatus(complaintUpdate).subscribe({
      next: (updatedComplaint) => {
        const index = this.complaints.findIndex(c => c.id === this.selectedComplaint!.id);
        if (index !== -1) {
          this.complaints[index] = updatedComplaint;
        }
        this.notificationService.showSuccess(`Status updated to ${this.selectedStatusUpdate}`);
        this.closeStatusModal();
        this.calculateStatistics();
        this.isProcessing = false;
      },
      error: (error) => {
        console.error('Error updating status:', error);
        this.notificationService.showError('Failed to update status');
        this.isProcessing = false;
      }
    });
  }

  // Navigation methods (matches your pattern)
  viewComplaintDetails(complaintId: string) {
    this.router.navigate(['/admin/complaints', complaintId]);
  }

  navigateToManagement() {
    this.router.navigate(['/admin/complaints/manage']);
  }

  // Pagination (matches your pattern)
  onPageChange(page: number) {
    this.currentPage = page;
    this.loadComplaints();
  }

  // Utility methods (matches your existing patterns)
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
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

  getContactPreferenceIcon(preference: string): string {
    return preference === 'Phone' ? 'fas fa-phone' : 'fas fa-envelope';
  }

  refreshData() {
    this.loadComplaints();
    this.notificationService.showSuccess('Data refreshed successfully');
  }
}
