import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DonationService } from '../../../services/donation';
import { Donation } from '../../../models/donation';

@Component({
  selector: 'app-donation-history',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './donation-history.html',
  styleUrls: ['./donation-history.css']
})
export class DonationHistoryComponent implements OnInit {
  donations: Donation[] = [];
  filteredDonations: Donation[] = [];
  filterStatus = '';
  startDate = '';
  endDate = '';

  constructor(private donationService: DonationService) {}

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.donationService.getDonations().subscribe(response => {
      this.donations = response.content?.filter((d: Donation) => d.status !== 'Pending') || [];
      this.filteredDonations = [...this.donations];
    });
  }

  applyFilters() {
    this.filteredDonations = this.donations.filter(donation => {
      const statusMatch = !this.filterStatus || donation.status === this.filterStatus;
      const dateMatch = this.checkDateRange(donation.reviewDate);
      return statusMatch && dateMatch;
    });
  }

  private checkDateRange(date: Date | undefined): boolean {
    if (!date) return true;
    const donationDate = new Date(date);
    const start = this.startDate ? new Date(this.startDate) : null;
    const end = this.endDate ? new Date(this.endDate) : null;
    
    if (start && donationDate < start) return false;
    if (end && donationDate > end) return false;
    return true;
  }

  clearFilters() {
    this.filterStatus = '';
    this.startDate = '';
    this.endDate = '';
    this.filteredDonations = [...this.donations];
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-IN');
  }
}
