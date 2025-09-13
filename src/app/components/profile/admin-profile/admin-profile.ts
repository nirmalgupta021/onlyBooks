import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { NotificationService } from '../../../services/notification';
import { Admin } from '../../../models/admin';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-profile.html',
  styleUrl: './admin-profile.css'
})
export class AdminProfileComponent implements OnInit {
  currentAdmin: Admin | null = null;
  isLoading = true;
  error: string | null = null;

  // Profile form
  profileForm!: FormGroup;
  isUpdatingProfile = false;

  // Password change form
  passwordForm!: FormGroup;
  isChangingPassword = false;

  // Modal states
  showPasswordModal = false;
  showProfileModal = false;

  // Backend connection status
  isBackendConnected = false;

  // Only show last login - get from AuthService
  lastLogin: Date | null = null;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.checkBackendConnection();
    this.initializeForms();
    this.loadAdminProfile();
  }

  // 🔧 UPDATED: USE AUTH SERVICE METHOD
  private checkBackendConnection() {
    this.isBackendConnected = this.authService.isBackendConnected();
  }

  // Initialize forms with validation
  private initializeForms() {
    this.profileForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [
        Validators.required
      ]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(20)
      ]],
      confirmPassword: ['', [
        Validators.required
      ]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Custom password match validator
  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  // Load admin profile data
  loadAdminProfile() {
    this.isLoading = true;
    this.error = null;

    // Get current admin from auth service
    this.currentAdmin = this.authService.getCurrentAdmin();
    
    if (this.currentAdmin) {
      this.profileForm.patchValue({
        name: this.currentAdmin.name,
        email: this.currentAdmin.email
      });

      // Get last login from AuthService (real data)
      this.lastLogin = this.authService.getLastLoginTime();
      this.isLoading = false;
    } else {
      this.error = 'Unable to load profile data';
      this.isLoading = false;
    }
  }

  // 🔧 CHECK BACKEND BEFORE OPENING PROFILE MODAL
  openProfileModal() {
    if (!this.isBackendConnected) {
      this.notificationService.showWarning('Profile editing is only available when backend is connected');
      return;
    }

    if (this.currentAdmin) {
      this.profileForm.patchValue({
        name: this.currentAdmin.name,
        email: this.currentAdmin.email
      });
      this.showProfileModal = true;
    }
  }

  // Close profile modal
  closeProfileModal() {
    this.showProfileModal = false;
    this.profileForm.reset();
  }

  // 🔧 UPDATED: USE AUTH SERVICE METHOD AND IMPROVED ERROR HANDLING
  updateProfile() {
    if (this.profileForm.valid && !this.isUpdatingProfile) {
      this.isUpdatingProfile = true;

      const profileData = {
        name: this.profileForm.get('name')?.value,
        email: this.profileForm.get('email')?.value
      };

      // 🔧 USE AUTH SERVICE METHOD
      this.authService.updateProfile(profileData).subscribe({
        next: (updatedAdmin) => {
          this.currentAdmin = updatedAdmin;
          this.notificationService.showSuccess('Profile updated successfully');
          this.closeProfileModal();
          this.isUpdatingProfile = false;
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.notificationService.showError(error.message || 'Failed to update profile');
          this.isUpdatingProfile = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.profileForm);
    }
  }

  // 🔧 CHECK BACKEND BEFORE OPENING PASSWORD MODAL
  openPasswordModal() {
    if (!this.isBackendConnected) {
      this.notificationService.showWarning('Password change is only available when backend is connected');
      return;
    }

    this.passwordForm.reset();
    this.showPasswordModal = true;
  }

  // Close password modal
  closePasswordModal() {
    this.showPasswordModal = false;
    this.passwordForm.reset();
  }

  // 🔧 UPDATED: USE AUTH SERVICE METHOD AND IMPROVED ERROR HANDLING
  changePassword() {
    if (this.passwordForm.valid && !this.isChangingPassword) {
      this.isChangingPassword = true;

      const currentPassword = this.passwordForm.get('currentPassword')?.value;
      const newPassword = this.passwordForm.get('newPassword')?.value;

      // 🔧 USE AUTH SERVICE METHOD
      this.authService.changePassword(currentPassword, newPassword).subscribe({
        next: () => {
          this.notificationService.showSuccess('Password changed successfully');
          this.closePasswordModal();
          this.isChangingPassword = false;
        },
        error: (error) => {
          console.error('Error changing password:', error);
          this.notificationService.showError(error.message || 'Failed to change password');
          this.isChangingPassword = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.passwordForm);
    }
  }

  // Navigation methods
  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.notificationService.showSuccess('Logged out successfully');
  }

  // Utility methods
  formatDate(date: Date | null): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateOnly(date: Date | null): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  // 🔧 GET BACKEND STATUS FOR DISPLAY
  getBackendStatus(): string {
    return this.isBackendConnected ? 'Connected' : 'Disconnected';
  }

  getBackendStatusClass(): string {
    return this.isBackendConnected ? 'badge bg-success' : 'badge bg-warning text-dark';
  }

  getBackendStatusIcon(): string {
    return this.isBackendConnected ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';
  }

  // Form validation helpers
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Form getters for validation
  get name() { return this.profileForm.get('name'); }
  get email() { return this.profileForm.get('email'); }

  get currentPassword() { return this.passwordForm.get('currentPassword'); }
  get newPassword() { return this.passwordForm.get('newPassword'); }
  get confirmPassword() { return this.passwordForm.get('confirmPassword'); }

  refreshProfile() {
    this.checkBackendConnection();
    this.loadAdminProfile();
    this.notificationService.showSuccess('Profile refreshed successfully');
  }
}
