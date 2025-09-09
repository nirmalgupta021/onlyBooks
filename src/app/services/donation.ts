import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Donation, DonationDecision } from '../models/donation';

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  private readonly API_URL = 'http://localhost:8080/api/donations';

  constructor(private http: HttpClient) {}

  getDonations(page: number = 0, size: number = 10, status?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
  
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<any>(`${this.API_URL}`, { params });
  }

  getPendingDonations(): Observable<Donation[]> {
    return this.http.get<Donation[]>(`${this.API_URL}/pending`);
  }

  getDonationById(id: string): Observable<Donation> {
    return this.http.get<Donation>(`${this.API_URL}/${id}`);
  }

  approveDonation(donationDecision: DonationDecision): Observable<Donation> {
    return this.http.patch<Donation>(
      `${this.API_URL}/${donationDecision.donationId}/approve`, 
      { comments: donationDecision.comments }
    );
  }

  rejectDonation(donationDecision: DonationDecision): Observable<Donation> {
    return this.http.patch<Donation>(
      `${this.API_URL}/${donationDecision.donationId}/reject`, 
      { comments: donationDecision.comments }
    );
  }

  searchDonations(searchTerm: string): Observable<Donation[]> {
    const params = new HttpParams().set('search', searchTerm);
    return this.http.get<Donation[]>(`${this.API_URL}/search`, { params });
  }

  getPendingDonationsCount(): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/pending-count`);
  }
}
