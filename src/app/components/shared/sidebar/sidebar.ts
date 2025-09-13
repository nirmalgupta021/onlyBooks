import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { DonationService } from '../../../services/donation';
import { ComplaintService } from '../../../services/complaint';
import { filter } from 'rxjs/operators';

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

  // Route tracking for exact matching
  currentRoute: string = '';

  constructor(
    private donationService: DonationService,
    private complaintService: ComplaintService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPendingCounts();

    // Track route changes for exact matching
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
      });

    // Set initial route
    this.currentRoute = this.router.url;
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

  // 🔧 BOOK MANAGEMENT - Exact route checking methods
  isOnBooksListPage(): boolean {
    return this.currentRoute === '/admin/books';
  }

  isOnAddBookPage(): boolean {
    return this.currentRoute === '/admin/books/add';
  }

  // 🔧 DONATIONS - Only 2 submenu items (Pending Requests & History)
  isOnPendingDonationsPage(): boolean {
    return this.currentRoute === '/admin/donations';
  }

  isOnDonationHistoryPage(): boolean {
    return this.currentRoute === '/admin/donations/history';
  }

  // 🔧 COMPLAINTS - Only 2 submenu items (All Complaints & Manage)
  isOnAllComplaintsPage(): boolean {
    return this.currentRoute === '/admin/complaints';
  }

  isOnManageComplaintsPage(): boolean {
    return this.currentRoute === '/admin/complaints/manage';
  }
}
