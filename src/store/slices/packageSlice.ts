import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { packageService } from '@/services/package/package.service';
import type { Package } from '@/services/package/package.models';

interface PackageState {
  packages: Package[];
  currentPackage: Package | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PackageState = {
  packages: [],
  currentPackage: null,
  isLoading: false,
  error: null,
};

export const fetchPackages = createAsyncThunk(
  'package/fetchPackages',
  async (params: any) => {
    const response = await packageService.getPackageList(params);
    return response;
  }
);

const packageSlice = createSlice({
  name: 'package',
  initialState,
  reducers: {
    clearCurrentPackage: (state) => {
      state.currentPackage = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPackages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPackages.fulfilled, (state, action: PayloadAction<Package[]>) => {
        state.isLoading = false;
        state.packages = action.payload;
      })
      .addCase(fetchPackages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch packages';
      });
  },
});

export const { clearCurrentPackage, clearError } = packageSlice.actions;
export default packageSlice.reducer;