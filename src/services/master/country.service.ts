import { apiClient } from '@/services/api/axios.instance';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import type { ApiResponse, PaginatedResponse } from '@/types/common.types';
import type { Country, CreateCountryRequest } from './country.models';

class CountryService {
  async getAll(params?: {
    page?: number;
    pageSize?: number;
    searchTerm?: string;
  }): Promise<PaginatedResponse<Country>> {
    const response = await apiClient.get<PaginatedResponse<Country>>(
      API_ENDPOINTS.COUNTRY.LIST,
      { params }
    );
    return response.data;
  }

  async getById(id: number): Promise<Country> {
    const response = await apiClient.get<ApiResponse<Country>>(
      API_ENDPOINTS.COUNTRY.DETAIL(id)
    );
    return response.data.data;
  }

  async create(data: CreateCountryRequest): Promise<Country> {
    const response = await apiClient.post<ApiResponse<Country>>(
      API_ENDPOINTS.COUNTRY.CREATE,
      data
    );
    return response.data.data;
  }

  async update(id: number, data: Partial<Country>): Promise<Country> {
    const response = await apiClient.put<ApiResponse<Country>>(
      API_ENDPOINTS.COUNTRY.UPDATE(id),
      data
    );
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.COUNTRY.DELETE(id));
  }
}

export const countryService = new CountryService();
export default countryService;