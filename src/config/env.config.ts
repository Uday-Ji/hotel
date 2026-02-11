interface EnvConfig {
  app: {
    name: string;
    version: string;
  };
  tenant: {
    companyCode: string;
  };
  api: {
    baseUrl: string;
    timeout: number;
  };
  auth: {
    tokenKey: string;
    refreshTokenKey: string;
  };
}

const getEnvVar = (key: string, defaultValue: string = ''): string => {
  const value = import.meta.env[key];
  if (value === undefined && !defaultValue) {
    console.warn(`Environment variable ${key} is not defined`);
  }
  return value || defaultValue;
};

export const envConfig: EnvConfig = {
  app: {
    name: getEnvVar('VITE_APP_NAME', 'Hotel Booking System'),
    version: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  },
  tenant: {
    companyCode: getEnvVar('VITE_COMPANY_CODE', 'DEFAULT_COMPANY'),
  },
  api: {
    baseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:5000/api'),
    timeout: parseInt(getEnvVar('VITE_API_TIMEOUT', '30000'), 10),
  },
  auth: {
    tokenKey: getEnvVar('VITE_TOKEN_KEY', 'auth_token'),
    refreshTokenKey: getEnvVar('VITE_REFRESH_TOKEN_KEY', 'refresh_token'),
  },
};

export default envConfig;