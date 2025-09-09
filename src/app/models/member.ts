export interface Member {
  id: string;
  name: string;
  email: string;
  mobileNumber: string;
  address: string;
  dateOfBirth: Date;
  registrationDate: Date;
  isActive: boolean;
  currentBorrowedBooks: number;
  totalFines: number;
  hasOverdueBooks: boolean;
}

export interface MemberDetails extends Member {
  borrowedBooks: BorrowedBook[];
  fineHistory: FineRecord[];
  complaints: ComplaintSummary[];
}

export interface BorrowedBook {
  bookId: string;
  bookTitle: string;
  author: string;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: 'Borrowed' | 'Returned' | 'Overdue';
  fine: number;
}

export interface FineRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  amount: number;
  reason: string;
  dateIncurred: Date;
  datePaid?: Date;
  status: 'Pending' | 'Paid';
}

export interface ComplaintSummary {
  id: string;
  title: string;
  category: string;
  status: string;
  submissionDate: Date;
}
