export interface User {
  id: string;
  userName: string;
  email: string;
  name: string;
  surname: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface FormError {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  surname?: string;
  general?: string;
}