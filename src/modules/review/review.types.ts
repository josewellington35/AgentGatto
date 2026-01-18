/**
 * DTOs para o módulo de Reviews
 */

export interface CreateReviewDTO {
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewDTO {
  rating?: number;
  comment?: string;
}

export interface ReviewResponseDTO {
  id: string;
  bookingId: string;
  userId: string;
  userName: string;
  serviceId: string;
  serviceName: string;
  companyId: string;
  companyName: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetReviewsQuery {
  serviceId?: string;
  companyId?: string;
  userId?: string;
  minRating?: number;
  sortBy?: 'rating' | 'createdAt';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ReviewStatsDTO {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
