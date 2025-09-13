import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login';
import { AdminDashboardComponent } from './components/dashboard/admin-dashboard/admin-dashboard';
import { BookListComponent } from './components/books/book-list/book-list';
import { AddBookComponent } from './components/books/add-book/add-book';
import { EditBookComponent } from './components/books/edit-book/edit-book';
import { BookBorrowersComponent } from './components/books/book-borrowers/book-borrowers';
import { MemberListComponent } from './components/members/member-list/member-list';
import { MemberSearchComponent } from './components/members/member-search/member-search';
import { MemberDetailsComponent } from './components/members/member-details/member-details';
import { DonationRequestsComponent } from './components/donations/donation-requests/donation-requests';
import { DonationHistoryComponent } from './components/donations/donation-history/donation-history';
import { ComplaintDashboardComponent } from './components/complaints/complaint-dashboard/complaint-dashboard';
import { ComplaintDetailsComponent } from './components/complaints/complaint-details/complaint-details';
import { ComplaintManagementComponent } from './components/complaints/complaint-management/complaint-management';
import { AnalyticsDashboard } from './components/reports/analytics-dashboard/analytics-dashboard';
import { AdminProfileComponent } from './components/profile/admin-profile/admin-profile';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'books', component: BookListComponent },
      { path: 'books/add', component: AddBookComponent },
      { path: 'books/edit/:id', component: EditBookComponent },
      { path: 'books/borrowers/:id', component: BookBorrowersComponent },
      { path: 'members', component: MemberListComponent },
      { path: 'members/search', component: MemberSearchComponent },
      { path: 'members/:id', component: MemberDetailsComponent },
      { path: 'donations', component: DonationRequestsComponent },
      { path: 'donations/history', component: DonationHistoryComponent },
      { path: 'complaints', component: ComplaintDashboardComponent },
      { path: 'complaints/:id', component: ComplaintDetailsComponent },
      { path: 'complaints/manage', component: ComplaintManagementComponent },
      { path: 'reports', component: AnalyticsDashboard },
      { path: 'profile', component: AdminProfileComponent }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
