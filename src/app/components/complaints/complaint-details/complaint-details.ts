import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ComplaintService } from '../../../services/complaint';
import { NotificationService } from '../../../services/notification';
import { Complaint, ComplaintUpdate } from '../../../models/complaint';
import { COMPLAINT_STATUSES } from '../../../utils/constants';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-complaint-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, ConfirmationDialogComponent],
  templateUrl: './complaint-details.html',
  styleUrl: './complaint-details.css'
})
export class ComplaintDetailsComponent implements OnInit {
  complaint: Complaint | null = null;
  isLoading = true;
  error: string | null = null;
  complaintId!: string;

  // Response form
  responseForm!: FormGroup;
  isSubmittingResponse = false;

  // Status update
  statusOptions = COMPLAINT_STATUSES;
  selectedStatus = '';
  isUpdatingStatus = false;

  // Modal states 
  showStatusModal = false;
  showResponseModal = false;

  constructor(
    private complaintService: ComplaintService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.complaintId = this.route.snapshot.params['id'];
    this.initializeResponseForm();
    this.loadComplaintDetails();
  }

  // Initialize response form with validation
  private initializeResponseForm() {
    this.responseForm = this.fb.group({
      responseText: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(1000)
      ]]
    });
  }

  // Load complaint details
  loadComplaintDetails() {
    this.isLoading = true;
    this.error = null;

    this.complaintService.getComplaintById(this.complaintId).subscribe({
      next: (complaint) => {
        this.complaint = complaint;
        this.selectedStatus = complaint.status;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading complaint details:', error);
        this.error = 'Failed to load complaint details. Please try again.';
        this.notificationService.showError('Failed to load complaint details');
        this.isLoading = false;
      }
    });
  }

  // Open response modal
  openResponseModal() {
    this.responseForm.reset();
    this.showResponseModal = true;
  }

  // Close response modal
  closeResponseModal() {
    this.showResponseModal = false;
    this.responseForm.reset();
  }

  // Submit response using your exact service method
  submitResponse() {
    if (this.responseForm.valid && !this.isSubmittingResponse) {
      this.isSubmittingResponse = true;
      const responseText = this.responseForm.get('responseText')?.value;

      this.complaintService.addResponse(this.complaintId, responseText).subscribe({
        next: () => {
          this.notificationService.showSuccess('Response added successfully');
          this.closeResponseModal();
          this.loadComplaintDetails(); // Reload to show new response
          this.isSubmittingResponse = false;
        },
        error: (error) => {
          console.error('Error adding response:', error);
          this.notificationService.showError('Failed to add response');
          this.isSubmittingResponse = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  // Open status update modal
  openStatusModal() {
    this.selectedStatus = this.complaint?.status || '';
    this.showStatusModal = true;
  }

  // Close status modal
  closeStatusModal() {
    this.showStatusModal = false;
    this.selectedStatus = this.complaint?.status || '';
  }

  // Update status using your exact service method and model
  updateStatus() {
    if (!this.complaint || !this.selectedStatus || this.isUpdatingStatus) return;

    this.isUpdatingStatus = true;
    const complaintUpdate: ComplaintUpdate = {
      complaintId: this.complaint.id,
      status: this.selectedStatus,
      responseText: `Status updated to ${this.selectedStatus} by Admin`
    };

    this.complaintService.updateComplaintStatus(complaintUpdate).subscribe({
      next: (updatedComplaint) => {
        this.complaint = updatedComplaint;
        this.notificationService.showSuccess(`Status updated to ${this.selectedStatus}`);
        this.closeStatusModal();
        this.isUpdatingStatus = false;
      },
      error: (error) => {
        console.error('Error updating status:', error);
        this.notificationService.showError('Failed to update status');
        this.isUpdatingStatus = false;
      }
    });
  }

  // Navigation methods (matches your pattern)
  goBack() {
    this.router.navigate(['/admin/complaints']);
  }

  viewMemberDetails() {
    if (this.complaint) {
      this.router.navigate(['/admin/members', this.complaint.memberId]);
    }
  }

  // Helper methods to avoid template errors
  getTotalResponses(): number {
    return this.complaint?.responses?.length || 0;
  }

  getAdminResponsesCount(): number {
    if (!this.complaint?.responses) return 0;
    return this.complaint.responses.filter(r => r.isFromAdmin).length;
  }

  getResolutionTimeDays(): number {
    if (!this.complaint?.resolutionDate) return 0;
    const submitted = new Date(this.complaint.submissionDate);
    const resolved = new Date(this.complaint.resolutionDate);
    const diffTime = Math.abs(resolved.getTime() - submitted.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Utility methods (matches your existing patterns)
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateOnly(date: Date): string {
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

  getDaysSinceSubmission(submissionDate: Date): number {
    const today = new Date();
    const submitted = new Date(submissionDate);
    const diffTime = Math.abs(today.getTime() - submitted.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isResolved(): boolean {
    return this.complaint?.status === 'Resolved' || this.complaint?.status === 'Closed';
  }

  // Form validation helper
  private markFormGroupTouched() {
    Object.keys(this.responseForm.controls).forEach(key => {
      const control = this.responseForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters for form validation
  get responseText() { 
    return this.responseForm.get('responseText'); 
  }

  refreshData() {
    this.loadComplaintDetails();
    this.notificationService.showSuccess('Data refreshed successfully');
  }
}
