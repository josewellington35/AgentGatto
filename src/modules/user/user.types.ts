import { UserRole } from '@prisma/client';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileInput {
  name?: string;
  phoneNumber?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserStats {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
}
