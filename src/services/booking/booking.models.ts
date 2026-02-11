import { BaseEntity } from '@/types/common.types';

export interface Booking extends BaseEntity {
  bookingNumber: string;
  bookingDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  hotelId: number;
  hotelName?: string;
  roomCategoryId: number;
  roomCategoryName?: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  numberOfRooms: number;
  numberOfAdults: number;
  numberOfChildren: number;
  mealPlanId: number;
  mealPlanName?: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  bookingStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded';
  specialRequests?: string;
  cancellationReason?: string;
  cancelledDate?: string;
}

export interface CreateBookingRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  hotelId: number;
  roomCategoryId: number;
  checkInDate: string;
  checkOutDate: string;
  numberOfRooms: number;
  numberOfAdults: number;
  numberOfChildren: number;
  mealPlanId: number;
  specialRequests?: string;
}

export interface BookingSearchParams {
  bookingNumber?: string;
  customerName?: string;
  customerEmail?: string;
  hotelId?: number;
  checkInDateFrom?: string;
  checkInDateTo?: string;
  bookingStatus?: string;
  paymentStatus?: string;
  page?: number;
  pageSize?: number;
}