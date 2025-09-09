import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookService } from '../../../services/book';
import { NotificationService } from '../../../services/notification';
import { Book, BookFormData } from '../../../models/book';
import { BOOK_CATEGORIES } from '../../../utils/constants';

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './add-book.html',
  styleUrls: ['./add-book.css']
})
export class AddBookComponent implements OnInit {
  bookForm!: FormGroup;
  bookCategories = BOOK_CATEGORIES;
  isSubmitting = false;
  imagePreview: string | null = null;
  selectedImageFile: File | null = null;
  imageError = '';
  showSuccessModal = false;
  addedBook: Book | null = null;

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      author: ['', [Validators.required, Validators.minLength(2)]],
      category: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      totalCopies: [1, [Validators.required, Validators.min(1)]]
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
    if (this.bookForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const bookData: BookFormData = {
        title: this.bookForm.value.title,
        author: this.bookForm.value.author,
        category: this.bookForm.value.category,
        description: this.bookForm.value.description,
        totalCopies: this.bookForm.value.totalCopies,
        imageFile: this.selectedImageFile || undefined
      };

      this.bookService.addBook(bookData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.addedBook = response;
          this.showSuccessModal = true;
          this.notificationService.showSuccess(`Book "${response.title}" added successfully`);
        },
        error: (error) => {
          console.error('Error adding book:', error);
          this.isSubmitting = false;
          this.notificationService.showError(error.error?.message || 'Failed to add book');
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  resetForm() {
    this.bookForm.reset();
    this.imagePreview = null;
    this.selectedImageFile = null;
    this.imageError = '';
    this.bookForm.patchValue({ totalCopies: 1 });
  }

  addAnotherBook() {
    this.showSuccessModal = false;
    this.addedBook = null;
    this.resetForm();
  }

  goToBooksList() {
    this.router.navigate(['/admin/books']);
  }

  private markFormGroupTouched() {
    Object.keys(this.bookForm.controls).forEach(key => {
      const control = this.bookForm.get(key);
      control?.markAsTouched();
    });
  }
}
