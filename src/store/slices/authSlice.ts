import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/services/auth/auth.service';
import type {
  User,
  LoginRequest,
  LoginResponse,
  LoginApiResponse,
} from '@/services/auth/auth.models';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/utils/constants';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: storage.get<User>(STORAGE_KEYS.USER_DATA),
  token: storage.get<string>(STORAGE_KEYS.AUTH_TOKEN),
  refreshToken: storage.get<string>(STORAGE_KEYS.REFRESH_TOKEN),
  isAuthenticated: !!storage.get<string>(STORAGE_KEYS.AUTH_TOKEN),
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk<
  LoginResponse,
  Omit<LoginRequest, 'companyCode'>
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const apiResponse: LoginApiResponse = await authService.login({
      ...credentials,
      companyCode:
        import.meta.env.VITE_COMPANY_CODE || 'DEFAULT_COMPANY',
    });

    // 🔥 Extract user from backend response
    const user = apiResponse.data;

    // 🔥 Hardcoded tokens (temporary)
    const token = 'jwt-token';
    const refreshToken = 'refresh-token';

    // 🔥 Save to storage
    storage.set(STORAGE_KEYS.USER_DATA, user);
    storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
    storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

    return {
      user,
      token,
      refreshToken,
    };
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Login failed'
    );
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  storage.remove(STORAGE_KEYS.USER_DATA);
  storage.remove(STORAGE_KEYS.AUTH_TOKEN);
  storage.remove(STORAGE_KEYS.REFRESH_TOKEN);

  await authService.logout();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
