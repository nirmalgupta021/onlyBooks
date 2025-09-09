import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../../services/book';
import { NotificationService } from '../../../services/notification';
import { Book } from '../../../models/book';
import { BOOK_CATEGORIES } from '../../../utils/constants';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog';
import { PaginationComponent } from '../../shared/pagination/pagination';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PaginationComponent, ConfirmationDialogComponent],
  templateUrl: './book-list.html',
  styleUrls: ['./book-list.css']
})
export class BookListComponent implements OnInit {
  books: Book[] = [];
  bookCategories = BOOK_CATEGORIES;
  isLoading = false;
  
  // Search and Filters
  searchTerm = '';
  selectedCategory = '';
  selectedStatus = '';
  
  // Pagination
  currentPage = 0;
  totalPages = 0;
  totalBooks = 0;
  pageSize = 10;

  // Delete functionality
  showDeleteConfirmation = false;
  bookToDelete: Book | null = null;
  isDeleting = false;

  constructor(
    private bookService: BookService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadBooks();
  }

  loadBooks() {
    this.isLoading = true;
    
    this.bookService.getBooks(this.currentPage, this.pageSize, this.buildSearchQuery()).subscribe({
      next: (response) => {
        this.books = response.content || [];
        this.totalPages = response.totalPages || 0;
        this.totalBooks = response.totalElements || 0;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading books:', error);
        this.notificationService.showError('Failed to load books');
        this.isLoading = false;
      }
    });
  }

  private buildSearchQuery(): string {
    const filters = [];
    if (this.searchTerm) filters.push(`search=${this.searchTerm}`);
    if (this.selectedCategory) filters.push(`category=${this.selectedCategory}`);
    if (this.selectedStatus) filters.push(`status=${this.selectedStatus}`);
    return filters.join('&');
  }

  onSearch() {
    this.currentPage = 0;
    this.loadBooks();
  }

  onCategoryChange() {
    this.currentPage = 0;
    this.loadBooks();
  }

  onStatusChange() {
    this.currentPage = 0;
    this.loadBooks();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.currentPage = 0;
    this.loadBooks();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadBooks();
  }

  getBookStatus(book: Book): string {
    if (!book.isActive) return 'Inactive';
    if (book.availableCopies > 0) return 'Available';
    if (book.availableCopies === 0 && book.totalCopies > 0) return 'Fully Borrowed';
    return 'Unavailable';
  }

  viewBorrowers(bookId: string) {
    // Navigate to borrowers view
    // Router navigation will be handled here
  }

  editBook(bookId: string) {
    // Navigate to edit book
    // Router navigation will be handled here
  }

  deleteBook(book: Book) {
    this.bookToDelete = book;
    this.showDeleteConfirmation = true;
  }

  confirmDelete() {
    if (!this.bookToDelete) return;
    
    this.isDeleting = true;
    
    this.bookService.deleteBook(this.bookToDelete.id).subscribe({
      next: () => {
        this.notificationService.showSuccess(`Book "${this.bookToDelete?.title}" deleted successfully`);
        this.showDeleteConfirmation = false;
        this.bookToDelete = null;
        this.isDeleting = false;
        this.loadBooks(); // Reload the list
      },
      error: (error) => {
        console.error('Error deleting book:', error);
        this.notificationService.showError('Failed to delete book');
        this.isDeleting = false;
      }
    });
  }

  cancelDelete() {
    this.showDeleteConfirmation = false;
    this.bookToDelete = null;
  }
}
