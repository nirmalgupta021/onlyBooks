import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book, BookBorrower, BookFormData } from '../models/book';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private readonly API_URL = 'http://localhost:8080/api/books';

  constructor(private http: HttpClient) {}

  getBooks(page: number = 0, size: number = 10, search?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<any>(`${this.API_URL}`, { params });
  }

  getBookById(id: string): Observable<Book> {
    return this.http.get<Book>(`${this.API_URL}/${id}`);
  }

  addBook(bookData: BookFormData): Observable<Book> {
    const formData = new FormData();
    formData.append('title', bookData.title);
    formData.append('author', bookData.author);
    formData.append('category', bookData.category);
    formData.append('description', bookData.description);
    formData.append('totalCopies', bookData.totalCopies.toString());
    
    if (bookData.imageFile) {
      formData.append('image', bookData.imageFile);
    }

    return this.http.post<Book>(`${this.API_URL}`, formData);
  }

  updateBook(id: string, bookData: BookFormData): Observable<Book> {
    const formData = new FormData();
    formData.append('title', bookData.title);
    formData.append('author', bookData.author);
    formData.append('category', bookData.category);
    formData.append('description', bookData.description);
    formData.append('totalCopies', bookData.totalCopies.toString());
    
    if (bookData.imageFile) {
      formData.append('image', bookData.imageFile);
    }

    return this.http.put<Book>(`${this.API_URL}/${id}`, formData);
  }

  deleteBook(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  getBookBorrowers(bookId: string): Observable<BookBorrower[]> {
    return this.http.get<BookBorrower[]>(`${this.API_URL}/${bookId}/borrowers`);
  }

  searchBooks(searchTerm: string, searchType: 'title' | 'author' | 'category' = 'title'): Observable<Book[]> {
    const params = new HttpParams()
      .set('searchTerm', searchTerm)
      .set('searchType', searchType);

    return this.http.get<Book[]>(`${this.API_URL}/search`, { params });
  }

  getBookCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/categories`);
  }
}
