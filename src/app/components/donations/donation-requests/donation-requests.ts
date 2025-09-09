import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DonationService } from '../../../services/donation';
import { NotificationService } from '../../../services/notification';
import { Donation, DonationDecision } from '../../../models/donation';
import { PaginationComponent } from '../../shared/pagination/pagination';

@Component({
  selector: 'app-donation-requests',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PaginationComponent],
  templateUrl: './donation-requests.html',
  styleUrls: ['./donation-requests.css']
})
export class DonationRequestsComponent implements OnInit {
  donations: Donation[] = [];
  isLoading = false;
  
  // Search and Filters
  searchTerm = '';
  selectedStatus = '';
  selectedDate = '';
  
  // Pagination
  currentPage = 0;
  totalPages = 0;
  pageSize = 9;

  // Statistics
  pendingCount = 0;
  approvedCount = 0;
  totalBooksReceived = 0;

  // Modal functionality
  showApprovalModal = false;
  showRejectionModal = false;
  selectedDonation: Donation | null = null;
  approvalComments = '';
  rejectionComments = '';
  isProcessing = false;

  constructor(
    private donationService: DonationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadDonations();
    this.loadStatistics();
  }

  loadDonations() {
    this.isLoading = true;
    
    this.donationService.getDonations(this.currentPage, this.pageSize, this.selectedStatus).subscribe({
      next: (response) => {
        this.donations = response.content || [];
        this.totalPages = response.totalPages || 0;
        this.isLoading = false;
        this.updateCounts();
      },
      error: (error) => {
        console.error('Error loading donations:', error);
        this.notificationService.showError('Failed to load donation requests');
        this.isLoading = false;
      }
    });
  }

  private loadStatistics() {
    // Load pending donations count
    this.donationService.getPendingDonationsCount().subscribe({
      next: (count) => this.pendingCount = count,
      error: () => this.pendingCount = 0
    });
  }

  private updateCounts() {
    this.approvedCount = this.donations.filter(d => 
      d.status === 'Approved' && this.isToday(d.reviewDate)
    ).length;
    
    this.totalBooksReceived = this.donations.filter(d => 
      d.status === 'Approved' && this.isThisMonth(d.reviewDate)
    ).reduce((sum, d) => sum + d.quantity, 0);
  }

  private isToday(date: Date | undefined): boolean {
    if (!date) return false;
    const today = new Date();
    const checkDate = new Date(date);
    return checkDate.toDateString() === today.toDateString();
  }

  private isThisMonth(date: Date | undefined): boolean {
    if (!date) return false;
    const today = new Date();
    const checkDate = new Date(date);
    return checkDate.getMonth() === today.getMonth() && 
           checkDate.getFullYear() === today.getFullYear();
  }

  onSearch() {
    this.currentPage = 0;
    this.loadDonations();
  }

  onStatusChange() {
    this.currentPage = 0;
    this.loadDonations();
  }

  onDateChange() {
    this.currentPage = 0;
    this.loadDonations();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedDate = '';
    this.currentPage = 0;
    this.loadDonations();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadDonations();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  openApprovalModal(donation: Donation) {
    this.selectedDonation = donation;
    this.approvalComments = '';
    this.showApprovalModal = true;
  }

  closeApprovalModal() {
    this.showApprovalModal = false;
    this.selectedDonation = null;
    this.approvalComments = '';
  }

  openRejectionModal(donation: Donation) {
    this.selectedDonation = donation;
    this.rejectionComments = '';
    this.showRejectionModal = true;
  }

  closeRejectionModal() {
    this.showRejectionModal = false;
    this.selectedDonation = null;
    this.rejectionComments = '';
  }

  confirmApproval() {
    if (!this.selectedDonation) return;

    this.isProcessing = true;
    const decision: DonationDecision = {
      donationId: this.selectedDonation.id,
      decision: 'Approved',
      comments: this.approvalComments.trim() || 'Donation approved for library collection.'
    };

    this.donationService.approveDonation(decision).subscribe({
      next: (updatedDonation) => {
        this.notificationService.showSuccess(
          `Donation "${updatedDonation.bookTitle}" approved successfully`
        );
        this.updateDonationInList(updatedDonation);
        this.closeApprovalModal();
        this.isProcessing = false;
        this.loadStatistics();
      },
      error: (error) => {
        console.error('Error approving donation:', error);
        this.notificationService.showError('Failed to approve donation');
        this.isProcessing = false;
      }
    });
  }

  confirmRejection() {
    if (!this.selectedDonation || !this.rejectionComments.trim()) return;

    this.isProcessing = true;
    const decision: DonationDecision = {
      donationId: this.selectedDonation.id,
      decision: 'Rejected',
      comments: this.rejectionComments.trim()
    };

    this.donationService.rejectDonation(decision).subscribe({
      next: (updatedDonation) => {
        this.notificationService.showSuccess(
          `Donation "${updatedDonation.bookTitle}" rejected`
        );
        this.updateDonationInList(updatedDonation);
        this.closeRejectionModal();
        this.isProcessing = false;
        this.loadStatistics();
      },
      error: (error) => {
        console.error('Error rejecting donation:', error);
        this.notificationService.showError('Failed to reject donation');
        this.isProcessing = false;
      }
    });
  }

  private updateDonationInList(updatedDonation: Donation) {
    const index = this.donations.findIndex(d => d.id === updatedDonation.id);
    if (index !== -1) {
      this.donations[index] = updatedDonation;
      this.updateCounts();
    }
  }
}
