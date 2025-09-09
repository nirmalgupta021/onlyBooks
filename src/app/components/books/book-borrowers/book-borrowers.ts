import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { BookService } from '../../../services/book';
import { NotificationService } from '../../../services/notification';
import { Book, BookBorrower } from '../../../models/book';

@Component({
  selector: 'app-book-borrowers',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './book-borrowers.html',
  styleUrls: ['./book-borrowers.css']
})
export class BookBorrowersComponent implements OnInit {
  currentBook: Book | null = null;
  borrowers: BookBorrower[] = [];
  isLoading = true;
  bookId!: string;

  constructor(
    private bookService: BookService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.bookId = this.route.snapshot.params['id'];
    this.loadBookData();
    this.loadBorrowers();
  }

  private loadBookData() {
    this.bookService.getBookById(this.bookId).subscribe({
      next: (book) => {
        this.currentBook = book;
      },
      error: (error) => {
        console.error('Error loading book:', error);
        this.notificationService.showError('Failed to load book details');
        this.router.navigate(['/admin/books']);
      }
    });
  }

  private loadBorrowers() {
    this.isLoading = true;
    
    this.bookService.getBookBorrowers(this.bookId).subscribe({
      next: (borrowers) => {
        this.borrowers = borrowers;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading borrowers:', error);
        this.notificationService.showError('Failed to load borrower information');
        this.isLoading = false;
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

  getDaysUntilDue(dueDate: Date): string {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} remaining`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else {
      return `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} overdue`;
    }
  }

  getActiveBorrowers(): number {
    return this.borrowers.filter(b => b.status === 'Active').length;
  }

  getOverdueBorrowers(): number {
    return this.borrowers.filter(b => b.status === 'Overdue').length;
  }

  getTotalCopiesBorrowed(): number {
    return this.borrowers.reduce((total, borrower) => total + borrower.copiesBorrowed, 0);
  }

  viewMemberDetails(memberId: string) {
    this.router.navigate(['/admin/members', memberId]);
  }

  sendReminder(borrower: BookBorrower) {
    // Implementation for sending reminder
    this.notificationService.showSuccess(`Reminder sent to ${borrower.memberName}`);
  }
}
