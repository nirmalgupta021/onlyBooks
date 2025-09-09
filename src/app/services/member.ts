import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Member, MemberDetails } from '../models/member';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private readonly API_URL = 'http://localhost:8080/api/members';

  constructor(private http: HttpClient) {}

  getMembers(page: number = 0, size: number = 10, search?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<any>(`${this.API_URL}`, { params });
  }

  getMemberById(id: string): Observable<MemberDetails> {
    return this.http.get<MemberDetails>(`${this.API_URL}/${id}`);
  }

  searchMembers(searchTerm: string): Observable<Member[]> {
    const params = new HttpParams().set('search', searchTerm);
    return this.http.get<Member[]>(`${this.API_URL}/search`, { params });
  }

  updateMemberStatus(id: string, isActive: boolean): Observable<Member> {
    return this.http.patch<Member>(`${this.API_URL}/${id}/status`, { isActive });
  }

  getMembersWithFines(): Observable<Member[]> {
    return this.http.get<Member[]>(`${this.API_URL}/with-fines`);
  }

  getMembersWithOverdueBooks(): Observable<Member[]> {
    return this.http.get<Member[]>(`${this.API_URL}/overdue-books`);
  }
}
