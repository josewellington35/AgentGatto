import { BookingStatus } from '@prisma/client';

// DTOs para requisições
export interface CreateBookingDTO {
  serviceId: string;
  date: string; // ISO 8601 date string
  timeSlot: string; // "HH:MM"
  notes?: string;
}

export interface UpdateBookingStatusDTO {
  status: BookingStatus;
}

export interface CancelBookingDTO {
  cancellationReason?: string;
}

export interface CheckAvailabilityDTO {
  serviceId: string;
  date: string;
}

// DTOs para respostas
export interface BookingResponseDTO {
  id: string;
  userId: string;
  serviceId: string;
  date: string;
  timeSlot: string;
  status: BookingStatus;
  totalPrice: string;
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  service?: {
    id: string;
    name: string;
    description: string;
    duration: number;
    price: string;
    companyId: string;
    company?: {
      id: string;
      name: string;
      address: string;
      phoneNumber: string;
    };
  };
  user?: {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
  };
}

export interface AvailableSlot {
  time: string;
  isAvailable: boolean;
}

export interface AvailabilityResponseDTO {
  date: string;
  slots: AvailableSlot[];
}

// Query params
export interface GetBookingsQuery {
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface GetCompanyBookingsQuery extends GetBookingsQuery {
  serviceId?: string;
}
