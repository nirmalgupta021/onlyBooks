import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MemberService } from '../../../services/member';
import { NotificationService } from '../../../services/notification';
import { Member } from '../../../models/member';
import { PaginationComponent } from '../../shared/pagination/pagination';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PaginationComponent, ConfirmationDialogComponent],
  templateUrl: './member-list.html',
  styleUrls: ['./member-list.css']
})
export class MemberListComponent implements OnInit {
  members: Member[] = [];
  isLoading = false;
  
  // Search and Filters
  searchTerm = '';
  selectedStatus = '';
  selectedFilter = '';
  
  // Pagination
  currentPage = 0;
  totalPages = 0;
  totalMembers = 0;
  pageSize = 10;

  // Statistics
  activeMembers = 0;
  membersWithFines = 0;
  membersWithOverdue = 0;

  // Status change functionality
  showStatusConfirmation = false;
  memberToUpdate: Member | null = null;
  isUpdatingStatus = false;

  constructor(
    private memberService: MemberService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadMembers();
    this.loadStatistics();
  }

  loadMembers() {
    this.isLoading = true;
    
    this.memberService.getMembers(this.currentPage, this.pageSize, this.buildSearchQuery()).subscribe({
      next: (response) => {
        this.members = response.content || [];
        this.totalPages = response.totalPages || 0;
        this.totalMembers = response.totalElements || 0;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading members:', error);
        this.notificationService.showError('Failed to load members');
        this.isLoading = false;
      }
    });
  }

  private buildSearchQuery(): string {
    const filters = [];
    if (this.searchTerm) filters.push(`search=${this.searchTerm}`);
    if (this.selectedStatus) filters.push(`status=${this.selectedStatus}`);
    if (this.selectedFilter) filters.push(`filter=${this.selectedFilter}`);
    return filters.join('&');
  }

  private loadStatistics() {
    // Load basic statistics for the dashboard cards
    this.activeMembers = this.members.filter(m => m.isActive).length;
    this.membersWithFines = this.members.filter(m => m.totalFines > 0).length;
    this.membersWithOverdue = this.members.filter(m => m.hasOverdueBooks).length;
  }

  onSearch() {
    this.currentPage = 0;
    this.loadMembers();
  }

  onStatusChange() {
    this.currentPage = 0;
    this.loadMembers();
  }

  onFilterChange() {
    this.currentPage = 0;
    this.loadMembers();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedFilter = '';
    this.currentPage = 0;
    this.loadMembers();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadMembers();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  viewMemberDetails(memberId: string) {
    // Navigate to member details
    // Router navigation implementation
  }

  toggleMemberStatus(member: Member) {
    this.memberToUpdate = member;
    this.showStatusConfirmation = true;
  }

  getStatusChangeMessage(): string {
    if (!this.memberToUpdate) return '';
    
    const action = this.memberToUpdate.isActive ? 'deactivate' : 'activate';
    return `Are you sure you want to ${action} member "${this.memberToUpdate.name}"?`;
  }

  confirmStatusChange() {
    if (!this.memberToUpdate) return;
    
    this.isUpdatingStatus = true;
    
    this.memberService.updateMemberStatus(this.memberToUpdate.id, !this.memberToUpdate.isActive).subscribe({
      next: (updatedMember) => {
        const action = updatedMember.isActive ? 'activated' : 'deactivated';
        this.notificationService.showSuccess(`Member "${updatedMember.name}" ${action} successfully`);
        
        // Update the member in the list
        const index = this.members.findIndex(m => m.id === updatedMember.id);
        if (index !== -1) {
          this.members[index] = updatedMember;
        }
        
        this.showStatusConfirmation = false;
        this.memberToUpdate = null;
        this.isUpdatingStatus = false;
        this.loadStatistics();
      },
      error: (error) => {
        console.error('Error updating member status:', error);
        this.notificationService.showError('Failed to update member status');
        this.isUpdatingStatus = false;
      }
    });
  }

  cancelStatusChange() {
    this.showStatusConfirmation = false;
    this.memberToUpdate = null;
  }

  sendNotification(member: Member) {
    // Implementation for sending notification to member
    this.notificationService.showSuccess(`Notification sent to ${member.name}`);
  }
}
