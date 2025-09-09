export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3
};

export const APP_CONSTANTS = {
  MAX_BOOKS_PER_USER: 5,
  BOOK_BORROWING_DAYS: 14,
  FINE_PER_DAY: 5,
  MAX_LOGIN_ATTEMPTS: 3,
  MIN_AGE_FOR_REGISTRATION: 14,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 3,
  ADDRESS_MIN_LENGTH: 10,
  MOBILE_MIN_DIGITS: 8,
  MOBILE_MAX_DIGITS: 10,
  COMPLAINT_TITLE_MIN: 10,
  COMPLAINT_TITLE_MAX: 100,
  COMPLAINT_DESC_MIN: 20,
  COMPLAINT_DESC_MAX: 500
};

export const COMPLAINT_CATEGORIES = [
  'Service Quality',
  'Book Availability',
  'Payment Issues',
  'Technical Problems',
  'Staff Behavior',
  'Facility Issues',
  'Other'
];

export const BOOK_CATEGORIES = [
  'Fiction',
  'Non-Fiction',
  'Science',
  'Technology',
  'History',
  'Biography',
  'Self-Help',
  'Business',
  'Academic',
  'Children',
  'Young Adult',
  'Reference'
];

export const DONATION_CONDITIONS = [
  'Excellent',
  'Good',
  'Fair',
  'Poor'
];

export const COMPLAINT_STATUSES = [
  'Open',
  'In Progress',
  'Resolved',
  'Closed'
];

export const DONATION_STATUSES = [
  'Pending',
  'Approved',
  'Rejected'
];

export const CONTACT_PREFERENCES = [
  'Email',
  'Phone'
];

export const PAGINATION_SIZES = [10, 20, 50, 100];

export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  API: 'YYYY-MM-DD',
  DATETIME: 'DD/MM/YYYY HH:mm'
};
