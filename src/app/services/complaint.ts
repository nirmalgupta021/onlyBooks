import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Complaint, ComplaintUpdate } from '../models/complaint';

@Injectable({
  providedIn: 'root'
})
export class ComplaintService {
  private readonly API_URL = 'http://localhost:8080/api/complaints';

  constructor(private http: HttpClient) {}

  getComplaints(page: number = 0, size: number = 10, filters?: any): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.category) params = params.set('category', filters.category);
      if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
      if (filters.search) params = params.set('search', filters.search);
    }

    return this.http.get<any>(`${this.API_URL}`, { params });
  }

  getComplaintById(id: string): Observable<Complaint> {
    return this.http.get<Complaint>(`${this.API_URL}/${id}`);
  }

  updateComplaintStatus(complaintUpdate: ComplaintUpdate): Observable<Complaint> {
    return this.http.patch<Complaint>(`${this.API_URL}/${complaintUpdate.complaintId}/status`, complaintUpdate);
  }

  assignComplaint(complaintId: string, assignedTo: string): Observable<Complaint> {
    return this.http.patch<Complaint>(`${this.API_URL}/${complaintId}/assign`, { assignedTo });
  }

  addResponse(complaintId: string, responseText: string): Observable<any> {
    return this.http.post(`${this.API_URL}/${complaintId}/responses`, {
      responseText,
      isFromAdmin: true
    });
  }

  getPendingComplaints(): Observable<Complaint[]> {
    return this.http.get<Complaint[]>(`${this.API_URL}/pending`);
  }

  searchComplaints(searchTerm: string): Observable<Complaint[]> {
    const params = new HttpParams().set('search', searchTerm);
    return this.http.get<Complaint[]>(`${this.API_URL}/search`, { params });
  }

  getComplaintCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/categories`);
  }
}
