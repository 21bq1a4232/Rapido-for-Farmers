import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import tractorReducer from './slices/tractorSlice';
import bookingReducer from './slices/bookingSlice';
import userReducer from './slices/userSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    tractors: tractorReducer,
    bookings: bookingReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;
