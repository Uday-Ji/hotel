import { apiClient } from '@/services/api/axios.instance';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import type { ApiResponse, PaginatedResponse } from '@/types/common.types';
import type {
  Booking,
  CreateBookingRequest,
  BookingSearchParams,
} from './booking.models';

class BookingService {
  async getBookings(
    params: BookingSearchParams
  ): Promise<PaginatedResponse<Booking>> {
    const response = await apiClient.get<PaginatedResponse<Booking>>(
      API_ENDPOINTS.BOOKING.LIST,
      { params }
    );
    return response.data;
  }

  async getBookingById(id: number): Promise<Booking> {
    const response = await apiClient.get<ApiResponse<Booking>>(
      API_ENDPOINTS.BOOKING.DETAIL(id)
    );
    return response.data.data;
  }

  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    const response = await apiClient.post<ApiResponse<Booking>>(
      API_ENDPOINTS.BOOKING.CREATE,
      data
    );
    return response.data.data;
  }

  async updateBooking(id: number, data: Partial<Booking>): Promise<Booking> {
    const response = await apiClient.put<ApiResponse<Booking>>(
      API_ENDPOINTS.BOOKING.UPDATE(id),
      data
    );
    return response.data.data;
  }

  async cancelBooking(id: number, reason: string): Promise<Booking> {
    const response = await apiClient.post<ApiResponse<Booking>>(
      API_ENDPOINTS.BOOKING.CANCEL(id),
      { reason }
    );
    return response.data.data;
  }

  async getBookingHistory(params: {
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Booking>> {
    const response = await apiClient.get<PaginatedResponse<Booking>>(
      API_ENDPOINTS.BOOKING.HISTORY,
      { params }
    );
    return response.data;
  }

  async searchBookings(
    params: BookingSearchParams
  ): Promise<PaginatedResponse<Booking>> {
    const response = await apiClient.get<PaginatedResponse<Booking>>(
      API_ENDPOINTS.BOOKING.SEARCH,
      { params }
    );
    return response.data;
  }
}

export const bookingService = new BookingService();
export default bookingService;