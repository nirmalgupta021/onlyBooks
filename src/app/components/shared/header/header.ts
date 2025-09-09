import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { Admin } from '../../../models/admin';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit {
  currentAdmin: Admin | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentAdmin$.subscribe(admin => {
      this.currentAdmin = admin;
    });
  }

  logout() {
    this.authService.logout();
  }
}
