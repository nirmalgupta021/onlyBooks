import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookService } from '../../../services/book';
import { NotificationService } from '../../../services/notification';
import { Book, BookFormData } from '../../../models/book';
import { BOOK_CATEGORIES } from '../../../utils/constants';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-edit-book',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ConfirmationDialogComponent],
  templateUrl: './edit-book.html',
  styleUrls: ['./edit-book.css']
})
export class EditBookComponent implements OnInit {
  bookForm!: FormGroup;
  currentBook: Book | null = null;
  bookCategories = BOOK_CATEGORIES;
  isLoading = true;
  isSubmitting = false;
  imagePreview: string | null = null;
  selectedImageFile: File | null = null;
  imageError = '';
  showUpdateConfirmation = false;
  bookId!: string;

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.bookId = this.route.snapshot.params['id'];
    this.loadBookData();
  }

  private loadBookData() {
    this.isLoading = true;
    
    this.bookService.getBookById(this.bookId).subscribe({
      next: (book) => {
        this.currentBook = book;
        this.initializeForm();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading book:', error);
        this.notificationService.showError('Failed to load book details');
        this.router.navigate(['/admin/books']);
      }
    });
  }

  private initializeForm() {
    this.bookForm = this.fb.group({
      title: [this.currentBook?.title || '', [Validators.required, Validators.minLength(2)]],
      author: [this.currentBook?.author || '', [Validators.required, Validators.minLength(2)]],
      category: [this.currentBook?.category || '', Validators.required],
      description: [this.currentBook?.description || '', [Validators.required, Validators.minLength(10)]],
      totalCopies: [this.currentBook?.totalCopies || 1, [Validators.required, Validators.min(1)]]
    });
  }

  // Getter methods for form controls
  get title() { return this.bookForm.get('title'); }
  get author() { return this.bookForm.get('author'); }
  get category() { return this.bookForm.get('category'); }
  get description() { return this.bookForm.get('description'); }
  get totalCopies() { return this.bookForm.get('totalCopies'); }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      this.imageError = 'Please select a valid image file (JPG, PNG, GIF)';
      return;
    }

    // Validate file size (2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      this.imageError = 'Image size must be less than 2MB';
      return;
    }

    this.imageError = '';
    this.selectedImageFile = file;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSubmit() {
    if (this.bookForm.valid && !this.isSubmitting && this.bookForm.dirty) {
      this.showUpdateConfirmation = true;
    } else {
      this.markFormGroupTouched();
    }
  }

  confirmUpdate() {
    this.isSubmitting = true;
    this.showUpdateConfirmation = false;

    const bookData: BookFormData = {
      title: this.bookForm.value.title,
      author: this.bookForm.value.author,
      category: this.bookForm.value.category,
      description: this.bookForm.value.description,
      totalCopies: this.bookForm.value.totalCopies,
      imageFile: this.selectedImageFile || undefined
    };

    this.bookService.updateBook(this.bookId, bookData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.notificationService.showSuccess(
          `Book "${response.title}" by ${response.author} updated successfully`
        );
        this.router.navigate(['/admin/books']);
      },
      error: (error) => {
        console.error('Error updating book:', error);
        this.isSubmitting = false;
        this.notificationService.showError(error.error?.message || 'Failed to update book');
      }
    });
  }

  cancelUpdate() {
    this.showUpdateConfirmation = false;
  }

  resetForm() {
    if (this.currentBook) {
      this.bookForm.patchValue({
        title: this.currentBook.title,
        author: this.currentBook.author,
        category: this.currentBook.category,
        description: this.currentBook.description,
        totalCopies: this.currentBook.totalCopies
      });
      this.imagePreview = null;
      this.selectedImageFile = null;
      this.imageError = '';
      this.bookForm.markAsPristine();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.bookForm.controls).forEach(key => {
      const control = this.bookForm.get(key);
      control?.markAsTouched();
    });
  }
}
