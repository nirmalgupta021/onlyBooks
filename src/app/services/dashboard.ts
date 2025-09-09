import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats, ChartData } from '../models/dashboard-stats';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = 'http://localhost:8080/api/dashboard';

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.API_URL}/stats`);
  }

  getBooksChartData(period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Observable<ChartData> {
    return this.http.get<ChartData>(`${this.API_URL}/charts/books?period=${period}`);
  }

  getMembersChartData(period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Observable<ChartData> {
    return this.http.get<ChartData>(`${this.API_URL}/charts/members?period=${period}`);
  }

  getComplaintsChartData(period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Observable<ChartData> {
    return this.http.get<ChartData>(`${this.API_URL}/charts/complaints?period=${period}`);
  }

  refreshStats(): Observable<DashboardStats> {
    return this.http.post<DashboardStats>(`${this.API_URL}/refresh`, {});
  }
}
