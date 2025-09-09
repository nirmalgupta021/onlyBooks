import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { APP_CONSTANTS } from './constants';

export class CustomValidators {
  
  static nameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      const namePattern = /^[a-zA-Z\s]+$/;
      const isValid = namePattern.test(value) && value.length >= APP_CONSTANTS.NAME_MIN_LENGTH;
      
      return isValid ? null : { invalidName: true };
    };
  }

  static passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /\d/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const isLengthValid = value.length >= APP_CONSTANTS.PASSWORD_MIN_LENGTH;

      const isValid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isLengthValid;
      
      return isValid ? null : { invalidPassword: true };
    };
  }

  static confirmPasswordValidator(passwordField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.parent?.get(passwordField)?.value;
      const confirmPassword = control.value;
      
      if (!password || !confirmPassword) return null;
      
      return password === confirmPassword ? null : { passwordMismatch: true };
    };
  }

  static mobileValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const mobilePattern = /^\d+$/;
      const isValid = mobilePattern.test(value) && 
                     value.length >= APP_CONSTANTS.MOBILE_MIN_DIGITS && 
                     value.length <= APP_CONSTANTS.MOBILE_MAX_DIGITS;
      
      return isValid ? null : { invalidMobile: true };
    };
  }

  static ageValidator(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const birthDate = new Date(value);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge = calculatedAge - 1;
      }

      return calculatedAge >= minAge ? null : { ageNotValid: true };
    };
  }

  static addressValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      return value.length >= APP_CONSTANTS.ADDRESS_MIN_LENGTH ? null : { invalidAddress: true };
    };
  }

  static complaintTitleValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      const isValid = value.length >= APP_CONSTANTS.COMPLAINT_TITLE_MIN && 
                     value.length <= APP_CONSTANTS.COMPLAINT_TITLE_MAX;
      
      return isValid ? null : { invalidComplaintTitle: true };
    };
  }

  static complaintDescriptionValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      const isValid = value.length >= APP_CONSTANTS.COMPLAINT_DESC_MIN && 
                     value.length <= APP_CONSTANTS.COMPLAINT_DESC_MAX;
      
      return isValid ? null : { invalidComplaintDescription: true };
    };
  }
}
