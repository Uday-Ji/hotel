import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { countryService } from '@/services/master/country.service';
import { cityService } from '@/services/master/city.service';
import type { Country } from '@/services/master/country.models';
import type { City } from '@/services/master/city.models';

interface MasterState {
  countries: Country[];
  cities: City[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MasterState = {
  countries: [],
  cities: [],
  isLoading: false,
  error: null,
};

export const fetchCountries = createAsyncThunk(
  'master/fetchCountries',
  async () => {
    const response = await countryService.getAll({ pageSize: 1000 });
    return response.data;
  }
);

export const fetchCitiesByCountry = createAsyncThunk(
  'master/fetchCitiesByCountry',
  async (countryId: number) => {
    const response = await cityService.getByCountry(countryId);
    return response;
  }
);

const masterSlice = createSlice({
  name: 'master',
  initialState,
  reducers: {
    clearCities: (state) => {
      state.cities = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        fetchCountries.fulfilled,
        (state, action: PayloadAction<Country[]>) => {
          state.countries = action.payload;
        }
      )
      .addCase(
        fetchCitiesByCountry.fulfilled,
        (state, action: PayloadAction<City[]>) => {
          state.cities = action.payload;
        }
      );
  },
});

export const { clearCities } = masterSlice.actions;
export default masterSlice.reducer;