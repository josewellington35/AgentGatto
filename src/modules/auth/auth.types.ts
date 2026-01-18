import { UserRole } from '@prisma/client';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    phoneNumber: string | null;
  };
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role?: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}
