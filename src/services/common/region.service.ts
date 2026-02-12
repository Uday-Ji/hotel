import { apiClient } from '../api/axios.instance';
import type { ApiResponse } from '@/types/api.types';
import type { Region, Country, HolidayCategory } from './region.models';

export const regionService = {
  async getRegionList(companyCode: string = 'SMT'): Promise<Region[]> {
    const response = await apiClient.post<ApiResponse<Region[]>>('/Common/RegionList', {
      companyCode,
    });
    return response.data.data;
  },

  async getCountryByRegion(regionId: number, companyCode: string = 'SMT'): Promise<Country[]> {
    const response = await apiClient.post<ApiResponse<Country[]>>('/Common/CountryByRegionList', {
      regionId,
      companyCode,
    });
    return response.data.data;
  },

  async getHolidayCategoryList(companyCode: string = 'SMT'): Promise<HolidayCategory[]> {
    const response = await apiClient.post<ApiResponse<HolidayCategory[]>>(
      '/Common/HolidayCategoryList',
      { companyCode }
    );
    return response.data.data;
  },
};