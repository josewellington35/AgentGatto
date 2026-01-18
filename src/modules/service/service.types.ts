import { Category } from '@prisma/client';

// DTOs para requisições
export interface CreateServiceDTO {
  companyId: string;
  name: string;
  description: string;
  duration: number; // minutos
  price: number;
  category: Category;
  imageUrl?: string;
}

export interface UpdateServiceDTO {
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  imageUrl?: string;
  isActive?: boolean;
}

export interface SearchServicesQuery {
  search?: string;
  category?: Category;
  companyId?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  sortBy?: 'price' | 'rating' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// DTOs para respostas
export interface ServiceResponseDTO {
  id: string;
  companyId: string;
  name: string;
  description: string;
  duration: number;
  price: string;
  isActive: boolean;
  imageUrl?: string;
  rating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
  company?: {
    id: string;
    name: string;
    category: Category;
    address: string;
    city?: string;
    rating: number;
    logo?: string;
  };
}

export interface ServiceDetailResponseDTO extends ServiceResponseDTO {
  reviews?: Array<{
    id: string;
    rating: number;
    comment?: string;
    userName: string;
    createdAt: string;
  }>;
}

export interface ServicesListResponseDTO {
  services: ServiceResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
