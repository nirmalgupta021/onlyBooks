import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MemberService } from '../../../services/member';
import { NotificationService } from '../../../services/notification';
import { Member } from '../../../models/member';
import { PaginationComponent } from '../../shared/pagination/pagination';

@Component({
  selector: 'app-member-search',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, PaginationComponent],
  templateUrl: './member-search.html',
  styleUrls: ['./member-search.css']
})
export class MemberSearchComponent implements OnInit {
  searchForm!: FormGroup;
  searchResults: Member[] = [];
  isSearching = false;
  hasSearched = false;
  totalResults = 0;
  totalPages = 0;
  currentPage = 0;
  pageSize = 10;

  constructor(
    private fb: FormBuilder,
    private memberService: MemberService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    this.searchForm = this.fb.group({
      memberName: [''],
      email: [''],
      mobileNumber: [''],
      memberId: [''],
      registrationDateFrom: [''],
      registrationDateTo: [''],
      status: [''],
      fineStatus: [''],
      bookStatus: ['']
    });
  }

  onSearch() {
    if (this.isFormEmpty()) {
      this.notificationService.showWarning('Please enter at least one search criteria');
      return;
    }

    this.isSearching = true;
    this.currentPage = 0;
    
    const searchCriteria = this.buildSearchCriteria();
    
    this.memberService.searchMembers(searchCriteria).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.totalResults = results.length;
        this.hasSearched = true;
        this.isSearching = false;
        
        if (results.length === 0) {
          this.notificationService.showInfo('No members found matching your criteria');
        } else {
          this.notificationService.showSuccess(`Found ${results.length} member(s)`);
        }
      },
      error: (error) => {
        console.error('Error searching members:', error);
        this.notificationService.showError('Failed to search members');
        this.isSearching = false;
      }
    });
  }

  private isFormEmpty(): boolean {
    const values = this.searchForm.value;
    return Object.values(values).every(value => !value || value === '');
  }

  private buildSearchCriteria(): string {
    const criteria: string[] = [];
    const values = this.searchForm.value;
  
    Object.keys(values).forEach((key: string) => {
      if (values[key] && values[key] !== '') {
        criteria.push(`${key}=${encodeURIComponent(values[key])}`);
      }
    });
  
    return criteria.join('&');
  }

  resetSearch() {
    this.searchForm.reset();
    this.searchResults = [];
    this.hasSearched = false;
    this.totalResults = 0;
    this.currentPage = 0;
  }

  onPageChange(page: number) {
    this.currentPage = page;
    // In a real implementation, you would reload data for the new page
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getMembershipDuration(registrationDate: Date): string {
    const now = new Date();
    const regDate = new Date(registrationDate);
    const diffTime = Math.abs(now.getTime() - regDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffMonths / 12);

    if (diffYears > 0) {
      return `${diffYears} year${diffYears === 1 ? '' : 's'}`;
    } else if (diffMonths > 0) {
      return `${diffMonths} month${diffMonths === 1 ? '' : 's'}`;
    } else {
      return `${diffDays} day${diffDays === 1 ? '' : 's'}`;
    }
  }

  viewMemberDetails(memberId: string) {
    this.router.navigate(['/admin/members', memberId]);
  }

  sendNotification(member: Member) {
    this.notificationService.showSuccess(`Notification sent to ${member.name}`);
  }
}
