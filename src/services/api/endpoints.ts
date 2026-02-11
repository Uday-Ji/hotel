export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    ME: '/auth/me',
  },

  HOTEL: {
    BASE: '/hotel',
    LIST: '/hotel/list',
    DETAIL: (id: number) => `/hotel/${id}`,
    CREATE: '/hotel/create',
    UPDATE: (id: number) => `/hotel/${id}/update`,
    DELETE: (id: number) => `/hotel/${id}/delete`,
    IMAGES: (id: number) => `/hotel/${id}/images`,
    FACILITIES: (id: number) => `/hotel/${id}/facilities`,
    ROOM_CATEGORIES: (id: number) => `/hotel/${id}/room-categories`,
    RATES: (id: number) => `/hotel/${id}/rates`,
    BLACKOUT: (id: number) => `/hotel/${id}/blackout`,
  },

  BOOKING: {
    BASE: '/booking',
    LIST: '/booking/list',
    DETAIL: (id: number) => `/booking/${id}`,
    CREATE: '/booking/create',
    UPDATE: (id: number) => `/booking/${id}/update`,
    CANCEL: (id: number) => `/booking/${id}/cancel`,
    HISTORY: '/booking/history',
    SEARCH: '/booking/search',
  },

  ALLOCATION: {
    BASE: '/allocation',
    LIST: '/allocation/list',
    DETAIL: (id: number) => `/allocation/${id}`,
    CREATE: '/allocation/create',
    UPDATE: (id: number) => `/allocation/${id}/update`,
    DELETE: (id: number) => `/allocation/${id}/delete`,
    REPORT: '/allocation/report',
  },

  RATE: {
    BASE: '/rate',
    LIST: '/rate/list',
    DETAIL: (id: number) => `/rate/${id}`,
    CREATE: '/rate/create',
    UPDATE: (id: number) => `/rate/${id}/update`,
    DELETE: (id: number) => `/rate/${id}/delete`,
    INACTIVE: '/rate/inactive',
  },

  COUNTRY: {
    BASE: '/master/country',
    LIST: '/master/country/list',
    DETAIL: (id: number) => `/master/country/${id}`,
    CREATE: '/master/country/create',
    UPDATE: (id: number) => `/master/country/${id}/update`,
    DELETE: (id: number) => `/master/country/${id}/delete`,
  },

  CITY: {
    BASE: '/master/city',
    LIST: '/master/city/list',
    BY_COUNTRY: (countryId: number) => `/master/city/by-country/${countryId}`,
    DETAIL: (id: number) => `/master/city/${id}`,
    CREATE: '/master/city/create',
    UPDATE: (id: number) => `/master/city/${id}/update`,
    DELETE: (id: number) => `/master/city/${id}/delete`,
  },

  USER: {
    BASE: '/user',
    LIST: '/user/list',
    DETAIL: (id: number) => `/user/${id}`,
    CREATE: '/user/create',
    UPDATE: (id: number) => `/user/${id}/update`,
    DELETE: (id: number) => `/user/${id}/delete`,
    ROLES: (id: number) => `/user/${id}/roles`,
  },

  ROLE: {
    BASE: '/role',
    LIST: '/role/list',
    DETAIL: (id: number) => `/role/${id}`,
    CREATE: '/role/create',
    UPDATE: (id: number) => `/role/${id}/update`,
    DELETE: (id: number) => `/role/${id}/delete`,
    MENUS: (id: number) => `/role/${id}/menus`,
  },

  REPORTS: {
    BOOKING: '/reports/booking',
    ALLOCATION: '/reports/allocation',
    VENDOR: '/reports/vendor',
    SALES: '/reports/sales',
  },

  TRANSFER: {
    BASE: '/transfer',
    LIST: '/transfer/list',
    DETAIL: (id: number) => `/transfer/${id}`,
    CREATE: '/transfer/create',
    UPDATE: (id: number) => `/transfer/${id}/update`,
    DELETE: (id: number) => `/transfer/${id}/delete`,
  },

  PACKAGE: {
    BASE: '/package',
    LIST: '/package/list',
    DETAIL: (id: number) => `/package/${id}`,
  },

  SIGHTSEEING: {
    BASE: '/sightseeing',
    LIST: '/sightseeing/list',
    DETAIL: (id: number) => `/sightseeing/${id}`,
  },

  CAR: {
    BASE: '/car',
    LIST: '/car/list',
    DETAIL: (id: number) => `/car/${id}`,
  },

  MARKET: {
    BASE: '/market',
    LIST: '/market/list',
    DETAIL: (id: number) => `/market/${id}`,
  },
} as const;

export default API_ENDPOINTS;