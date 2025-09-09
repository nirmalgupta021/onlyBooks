import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MemberService } from '../../../services/member';
import { NotificationService } from '../../../services/notification';
import { MemberDetails } from '../../../models/member';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-member-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfirmationDialogComponent],
  templateUrl: './member-details.html',
  styleUrls: ['./member-details.css']
})
export class MemberDetailsComponent implements OnInit {
  memberDetails: MemberDetails | null = null;
  isLoading = true;
  activeTab = 'books';
  showStatusConfirmation = false;
  isUpdating = false;
  memberId!: string;

  constructor(
    private memberService: MemberService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.memberId = this.route.snapshot.params['id'];
    this.loadMemberDetails();
  }

  private loadMemberDetails() {
    this.isLoading = true;
    
    this.memberService.getMemberById(this.memberId).subscribe({
      next: (details) => {
        this.memberDetails = details;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading member details:', error);
        this.notificationService.showError('Failed to load member details');
        this.router.navigate(['/admin/members']);
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  isOverdue(dueDate: Date): boolean {
    return new Date(dueDate) < new Date();
  }

  toggleMemberStatus() {
    this.showStatusConfirmation = true;
  }

  getStatusChangeMessage(): string {
    if (!this.memberDetails) return '';
    
    const action = this.memberDetails.isActive ? 'deactivate' : 'activate';
    return `Are you sure you want to ${action} member "${this.memberDetails.name}"?`;
  }

  confirmStatusChange() {
    if (!this.memberDetails) return;
    
    this.isUpdating = true;
    
    this.memberService.updateMemberStatus(this.memberDetails.id, !this.memberDetails.isActive).subscribe({
      next: (updatedMember) => {
        const action = updatedMember.isActive ? 'activated' : 'deactivated';
        this.notificationService.showSuccess(`Member "${updatedMember.name}" ${action} successfully`);
        
        if (this.memberDetails) {
          this.memberDetails.isActive = updatedMember.isActive;
        }
        
        this.showStatusConfirmation = false;
        this.isUpdating = false;
      },
      error: (error) => {
        console.error('Error updating member status:', error);
        this.notificationService.showError('Failed to update member status');
        this.isUpdating = false;
      }
    });
  }

  cancelStatusChange() {
    this.showStatusConfirmation = false;
  }

  sendNotification() {
    if (this.memberDetails) {
      this.notificationService.showSuccess(`Notification sent to ${this.memberDetails.name}`);
    }
  }

  exportMemberData() {
    if (this.memberDetails) {
      this.notificationService.showSuccess(`Exporting data for ${this.memberDetails.name}`);
    }
  }

  viewComplaint(complaintId: string) {
    this.router.navigate(['/admin/complaints', complaintId]);
  }
}
