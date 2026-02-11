export interface LoginRequest {
  userId: string;
  password: string;
  companyCode: string;
}

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  companyName: string;
  emailId: string;
  userTypeCode: string;
  userType: string;
  userRole: string;
  tempPassword: boolean;
}

export interface LoginApiResponse {
  status: {
    statusCode: number;
    success: boolean;
    messageCode: string;
    messageText: string;
  };
  data: User;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// export interface LoginRequest {
//   companyCode: string;
//   userId: string;
//   password: string;
// }

// export interface LoginResponse {
//   success: boolean;
//   message: string;
//   statusCode: number;
//   messageCode: string;
//   messageText: string;
//   data: {
//     token: string;
//     refreshToken: string;
//     user: User;
//   };
// }



// export interface User {
//   id: number;
//   username: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   companyCode: string;
//   roleId: number;
//   roleName: string;
//   permissions: string[];
//   isActive: boolean;
//   userId: string;
//   companyName: string;
//   emailId: string;
//   userTypeCode: string;
//   userType: string;
//   userRole: string;
//   tempPassword: boolean;
// }

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    token: string;
    refreshToken: string;
  };
}