import { apiClient } from '@/services/api/axios.instance';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import type { ApiResponse, PaginatedResponse } from '@/types/common.types';
import type {
  Hotel,
  CreateHotelRequest,
  UpdateHotelRequest,
  HotelSearchParams,
} from './hotel.models';

class HotelService {
  async getHotels(params: HotelSearchParams): Promise<PaginatedResponse<Hotel>> {
    const response = await apiClient.get<PaginatedResponse<Hotel>>(
      API_ENDPOINTS.HOTEL.LIST,
      { params }
    );
    return response.data;
  }

  async getHotelById(id: number): Promise<Hotel> {
    const response = await apiClient.get<ApiResponse<Hotel>>(
      API_ENDPOINTS.HOTEL.DETAIL(id)
    );
    return response.data.data;
  }

  async createHotel(data: CreateHotelRequest): Promise<Hotel> {
    const response = await apiClient.post<ApiResponse<Hotel>>(
      API_ENDPOINTS.HOTEL.CREATE,
      data
    );
    return response.data.data;
  }

  async updateHotel(id: number, data: UpdateHotelRequest): Promise<Hotel> {
    const response = await apiClient.put<ApiResponse<Hotel>>(
      API_ENDPOINTS.HOTEL.UPDATE(id),
      data
    );
    return response.data.data;
  }

  async deleteHotel(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.HOTEL.DELETE(id));
  }
}

export const hotelService = new HotelService();
export default hotelService;