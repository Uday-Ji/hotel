import { BaseEntity } from '@/types/common.types';

export interface Hotel extends BaseEntity {
  hotelCode: string;
  hotelName: string;
  address: string;
  cityId: number;
  cityName?: string;
  countryId: number;
  countryName?: string;
  areaId?: number;
  areaName?: string;
  latitude?: number;
  longitude?: number;
  starRating: number;
  hotelCategoryId: number;
  hotelCategoryName?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  description?: string;
  checkInTime?: string;
  checkOutTime?: string;
  currencyId: number;
  currencyCode?: string;
  taxPercentage?: number;
}

export interface CreateHotelRequest {
  hotelCode: string;
  hotelName: string;
  address: string;
  cityId: number;
  countryId: number;
  areaId?: number;
  latitude?: number;
  longitude?: number;
  starRating: number;
  hotelCategoryId: number;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  description?: string;
  checkInTime?: string;
  checkOutTime?: string;
  currencyId: number;
  taxPercentage?: number;
}

export interface UpdateHotelRequest extends Partial<CreateHotelRequest> {
  id: number;
}

export interface HotelSearchParams {
  searchTerm?: string;
  cityId?: number;
  countryId?: number;
  starRating?: number;
  categoryId?: number;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}