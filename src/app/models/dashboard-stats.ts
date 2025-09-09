export interface DashboardStats {
  totalBooks: number;
  totalMembers: number;
  totalBorrowedBooks: number;
  totalComplaints: number;
  pendingComplaints: number;
  overdueBooks: number;
  totalFines: number;
  pendingDonations: number;
  monthlyStats: MonthlyStats;
  recentActivities: RecentActivity[];
}

export interface MonthlyStats {
  booksAdded: number;
  newMembers: number;
  booksIssued: number;
  complaintsResolved: number;
  finesCollected: number;
}

export interface RecentActivity {
  id: string;
  type: 'Book Added' | 'Member Registered' | 'Book Borrowed' | 'Book Returned' | 'Complaint Filed' | 'Fine Paid';
  description: string;
  timestamp: Date;
  memberId?: string;
  memberName?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}
