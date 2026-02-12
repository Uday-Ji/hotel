import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import hotelReducer from './slices/hotelSlice';
import bookingReducer from './slices/bookingSlice';
import masterReducer from './slices/masterSlice';
import uiReducer from './slices/uiSlice';
import packageReducer from './slices/packageSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    hotel: hotelReducer,
    booking: bookingReducer,
    master: masterReducer,
    ui: uiReducer,
    package: packageReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/login/fulfilled', 'auth/logout/fulfilled'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;