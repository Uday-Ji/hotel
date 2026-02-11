import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { bookingService } from '@/services/booking/booking.service';
import type {
  Booking,
  BookingSearchParams,
} from '@/services/booking/booking.models';
import type { PaginatedResponse } from '@/types/common.types';

interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  bookings: [],
  currentBooking: null,
  total: 0,
  page: 1,
  pageSize: 10,
  isLoading: false,
  error: null,
};

export const fetchBookings = createAsyncThunk(
  'booking/fetchBookings',
  async (params: BookingSearchParams) => {
    const response = await bookingService.getBookings(params);
    return response;
  }
);

export const fetchBookingById = createAsyncThunk(
  'booking/fetchBookingById',
  async (id: number) => {
    const response = await bookingService.getBookingById(id);
    return response;
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        fetchBookings.fulfilled,
        (state, action: PayloadAction<PaginatedResponse<Booking>>) => {
          state.isLoading = false;
          state.bookings = action.payload.data;
          state.total = action.payload.total;
        }
      )
      .addCase(
        fetchBookingById.fulfilled,
        (state, action: PayloadAction<Booking>) => {
          state.currentBooking = action.payload;
        }
      );
  },
});

export const { clearCurrentBooking } = bookingSlice.actions;
export default bookingSlice.reducer;