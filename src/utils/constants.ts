export const APP_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  DATE_FORMAT: 'DD/MM/YYYY',
  DATETIME_FORMAT: 'DD/MM/YYYY HH:mm:ss',
  TIME_FORMAT: 'HH:mm',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ROUTES = {
  LOGIN: '/login',
  WELCOME: '/welcome',
  PLAIN: '/plain',
  DASHBOARD: '/dashboard',
  CHOOSE_HOTEL: '/choose-hotel',
  HOTEL: '/hotel',
  BOOKING: '/booking',
  RATE: '/rate',
  MASTER: '/master',
  USER: '/user',
  REPORTS: '/reports',
  TRANSFER: '/transfer',
  PACKAGE: '/package',
  SIGHTSEEING: '/sightseeing',
  CAR: '/car',
  MARKET: '/market',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME_MODE: 'theme_mode',
  LANGUAGE: 'language',
} as const;

export const MODULE_IDS = {
  HOTEL: 'hotel',
  BOOKING: 'booking',
  RATE: 'rate',
  MASTER: 'master',
  USER: 'user',
  REPORTS: 'reports',
  TRANSFER: 'transfer',
  PACKAGE: 'package',
  SIGHTSEEING: 'sightseeing',
  CAR: 'car',
  MARKET: 'market',
} as const;