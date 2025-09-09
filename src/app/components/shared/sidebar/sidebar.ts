import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DonationService } from '../../../services/donation';
import { ComplaintService } from '../../../services/complaint';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent implements OnInit {
  isBookMenuOpen = false;
  isDonationMenuOpen = false;
  isComplaintMenuOpen = false;
  pendingDonationsCount = 0;
  pendingComplaintsCount = 0;

  constructor(
    private donationService: DonationService,
    private complaintService: ComplaintService
  ) {}

  ngOnInit() {
    this.loadPendingCounts();
  }

  toggleBookMenu() {
    this.isBookMenuOpen = !this.isBookMenuOpen;
  }

  toggleDonationMenu() {
    this.isDonationMenuOpen = !this.isDonationMenuOpen;
  }

  toggleComplaintMenu() {
    this.isComplaintMenuOpen = !this.isComplaintMenuOpen;
  }

  private loadPendingCounts() {
    this.donationService.getPendingDonationsCount().subscribe({
      next: (count) => this.pendingDonationsCount = count,
      error: () => this.pendingDonationsCount = 0
    });

    this.complaintService.getPendingComplaints().subscribe({
      next: (complaints) => this.pendingComplaintsCount = complaints.length,
      error: () => this.pendingComplaintsCount = 0
    });
  }
}
