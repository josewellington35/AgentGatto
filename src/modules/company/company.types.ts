import { Category, CompanyStatus } from '@prisma/client';

// DTOs para requisições
export interface CreateCompanyDTO {
  name: string;
  responsible: string;
  email: string;
  phoneNumber: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  category: Category;
  description: string;
  logo?: string;
  coverImage?: string;
}

export interface UpdateCompanyDTO {
  name?: string;
  responsible?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  category?: Category;
  description?: string;
  logo?: string;
  coverImage?: string;
}

export interface UpdateCompanyStatusDTO {
  status: CompanyStatus;
  rejectionReason?: string;
}

export interface CreateTimeSlotDTO {
  companyId: string;
  dayOfWeek?: number; // 0-6 (0=domingo), null=todos os dias
  startTime: string; // "08:00"
  endTime: string; // "18:00"
  duration: number; // minutos
}

export interface UpdateTimeSlotDTO {
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  duration?: number;
  isActive?: boolean;
}

export interface SearchCompaniesQuery {
  search?: string;
  category?: Category;
  city?: string;
  status?: CompanyStatus;
  minRating?: number;
  sortBy?: 'rating' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// DTOs para respostas
export interface CompanyResponseDTO {
  id: string;
  name: string;
  responsible: string;
  email: string;
  phoneNumber: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  category: Category;
  description: string;
  status: CompanyStatus;
  logo?: string;
  coverImage?: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyDetailResponseDTO extends CompanyResponseDTO {
  services?: Array<{
    id: string;
    name: string;
    price: string;
    duration: number;
    rating: number;
  }>;
  timeSlots?: TimeSlotResponseDTO[];
  stats?: {
    totalServices: number;
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
  };
}

export interface TimeSlotResponseDTO {
  id: string;
  companyId: string;
  dayOfWeek?: number;
  startTime: string;
  endTime: string;
  duration: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyStatsDTO {
  totalServices: number;
  activeServices: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageRating: number;
  recentBookings: Array<{
    id: string;
    date: string;
    timeSlot: string;
    status: string;
    serviceName: string;
    clientName: string;
  }>;
}

export interface CompaniesListResponseDTO {
  companies: CompanyResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
