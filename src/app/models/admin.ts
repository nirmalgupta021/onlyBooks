export interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin?: Date;
  isActive: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  admin: Admin;
  expiresIn: number;
}
