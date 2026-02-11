import { BaseEntity } from '@/types/common.types';

export interface City extends BaseEntity {
  cityCode: string;
  cityName: string;
  countryId: number;
  countryName?: string;
  stateProvince?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isPopular: boolean;
}

export interface CreateCityRequest {
  cityCode: string;
  cityName: string;
  countryId: number;
  stateProvince?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isPopular?: boolean;
}