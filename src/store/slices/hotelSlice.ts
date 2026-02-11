import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { hotelService } from '@/services/hotel/hotel.service';
import type { Hotel, HotelSearchParams } from '@/services/hotel/hotel.models';
import type { PaginatedResponse } from '@/types/common.types';

interface HotelState {
  hotels: Hotel[];
  currentHotel: Hotel | null;
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: HotelState = {
  hotels: [],
  currentHotel: null,
  total: 0,
  page: 1,
  pageSize: 10,
  isLoading: false,
  error: null,
};

export const fetchHotels = createAsyncThunk(
  'hotel/fetchHotels',
  async (params: HotelSearchParams) => {
    const response = await hotelService.getHotels(params);
    return response;
  }
);

export const fetchHotelById = createAsyncThunk(
  'hotel/fetchHotelById',
  async (id: number) => {
    const response = await hotelService.getHotelById(id);
    return response;
  }
);

export const createHotel = createAsyncThunk(
  'hotel/createHotel',
  async (data: any) => {
    const response = await hotelService.createHotel(data);
    return response;
  }
);

export const updateHotel = createAsyncThunk(
  'hotel/updateHotel',
  async ({ id, data }: { id: number; data: any }) => {
    const response = await hotelService.updateHotel(id, data);
    return response;
  }
);

export const deleteHotel = createAsyncThunk(
  'hotel/deleteHotel',
  async (id: number) => {
    await hotelService.deleteHotel(id);
    return id;
  }
);

const hotelSlice = createSlice({
  name: 'hotel',
  initialState,
  reducers: {
    clearCurrentHotel: (state) => {
      state.currentHotel = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotels.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchHotels.fulfilled,
        (state, action: PayloadAction<PaginatedResponse<Hotel>>) => {
          state.isLoading = false;
          state.hotels = action.payload.data;
          state.total = action.payload.total;
          state.page = action.payload.page;
          state.pageSize = action.payload.pageSize;
        }
      )
      .addCase(fetchHotels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch hotels';
      })
      .addCase(fetchHotelById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        fetchHotelById.fulfilled,
        (state, action: PayloadAction<Hotel>) => {
          state.isLoading = false;
          state.currentHotel = action.payload;
        }
      )
      .addCase(createHotel.fulfilled, (state, action: PayloadAction<Hotel>) => {
        state.hotels.unshift(action.payload);
      })
      .addCase(updateHotel.fulfilled, (state, action: PayloadAction<Hotel>) => {
        const index = state.hotels.findIndex((h) => h.id === action.payload.id);
        if (index !== -1) {
          state.hotels[index] = action.payload;
        }
        if (state.currentHotel?.id === action.payload.id) {
          state.currentHotel = action.payload;
        }
      })
      .addCase(deleteHotel.fulfilled, (state, action: PayloadAction<number>) => {
        state.hotels = state.hotels.filter((h) => h.id !== action.payload);
      });
  },
});

export const { clearCurrentHotel, clearError } = hotelSlice.actions;
export default hotelSlice.reducer;