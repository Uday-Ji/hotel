import { apiClient } from '@/services/api/axios.instance';
import type {
  LoginApiResponse,
  LoginRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  User,
} from './auth.models';
import { API_ENDPOINTS } from '@/services/api/endpoints';

class AuthService {
  /**
   * Login API
   * Backend returns:
   * {
   *   status: {...},
   *   data: User
   * }
   */
  async login(credentials: LoginRequest): Promise<LoginApiResponse> {
    const response = await apiClient.post<LoginApiResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    // Just return backend response
    return response.data;
  }

  /**
   * Logout API
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Refresh Token (for future use when backend supports it)
   */
  async refreshToken(
    refreshToken: string
  ): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      { refreshToken } as RefreshTokenRequest
    );

    return response.data;
  }

  /**
   * Get current logged-in user
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ data: User }>(
      API_ENDPOINTS.AUTH.ME
    );

    return response.data.data;
  }

  /**
   * Verify token validity
   */
  async verifyToken(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();
export default authService;
