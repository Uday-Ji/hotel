import { apiClient } from '@/services/api/axios.instance';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import type { ApiResponse, PaginatedResponse } from '@/types/common.types';
import type { City, CreateCityRequest } from './city.models';

class CityService {
  async getAll(params?: {
    page?: number;
    pageSize?: number;
    searchTerm?: string;
    countryId?: number;
  }): Promise<PaginatedResponse<City>> {
    const response = await apiClient.get<PaginatedResponse<City>>(
      API_ENDPOINTS.CITY.LIST,
      { params }
    );
    return response.data;
  }

  async getByCountry(countryId: number): Promise<City[]> {
    const response = await apiClient.get<ApiResponse<City[]>>(
      API_ENDPOINTS.CITY.BY_COUNTRY(countryId)
    );
    return response.data.data;
  }

  async getById(id: number): Promise<City> {
    const response = await apiClient.get<ApiResponse<City>>(
      API_ENDPOINTS.CITY.DETAIL(id)
    );
    return response.data.data;
  }

  async create(data: CreateCityRequest): Promise<City> {
    const response = await apiClient.post<ApiResponse<City>>(
      API_ENDPOINTS.CITY.CREATE,
      data
    );
    return response.data.data;
  }

  async update(id: number, data: Partial<City>): Promise<City> {
    const response = await apiClient.put<ApiResponse<City>>(
      API_ENDPOINTS.CITY.UPDATE(id),
      data
    );
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.CITY.DELETE(id));
  }
}

export const cityService = new CityService();
export default cityService;