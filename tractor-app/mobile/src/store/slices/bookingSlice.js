import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingAPI } from '../../services/api';

// Async thunks
export const fetchMyBookings = createAsyncThunk(
  'bookings/fetchMy',
  async (params, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.getMyBookings(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBookingById = createAsyncThunk(
  'bookings/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.getBookingById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createBooking = createAsyncThunk(
  'bookings/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.createBooking(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const acceptBooking = createAsyncThunk(
  'bookings/accept',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.acceptBooking(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const rejectBooking = createAsyncThunk(
  'bookings/reject',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.rejectBooking(id, reason);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const startBooking = createAsyncThunk(
  'bookings/start',
  async ({ id, otp }, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.startBooking(id, otp);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const completeBooking = createAsyncThunk(
  'bookings/complete',
  async ({ id, otp }, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.completeBooking(id, otp);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancel',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.cancelBooking(id, reason);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const rateBooking = createAsyncThunk(
  'bookings/rate',
  async ({ id, rating, review }, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.rateBooking(id, rating, review);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const payForBooking = createAsyncThunk(
  'bookings/pay',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.payForBooking(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  bookings: [],
  selectedBooking: null,
  loading: false,
  error: null,
  actionLoading: false, // For accept/reject/start/complete actions
};

// Slice
const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedBooking: (state, action) => {
      state.selectedBooking = action.payload;
    },
    clearSelectedBooking: (state) => {
      state.selectedBooking = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch My Bookings
    builder
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.bookings || [];
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Booking By ID
    builder
      .addCase(fetchBookingById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBooking = action.payload.booking;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create Booking
    builder
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.unshift(action.payload.booking);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Accept Booking
    builder
      .addCase(acceptBooking.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(acceptBooking.fulfilled, (state, action) => {
        state.actionLoading = false;
        updateBookingInState(state, action.payload.booking);
      })
      .addCase(acceptBooking.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // Reject Booking
    builder
      .addCase(rejectBooking.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(rejectBooking.fulfilled, (state, action) => {
        state.actionLoading = false;
        updateBookingInState(state, action.payload.booking);
      })
      .addCase(rejectBooking.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // Start Booking
    builder
      .addCase(startBooking.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(startBooking.fulfilled, (state, action) => {
        state.actionLoading = false;
        updateBookingInState(state, action.payload.booking);
      })
      .addCase(startBooking.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // Complete Booking
    builder
      .addCase(completeBooking.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(completeBooking.fulfilled, (state, action) => {
        state.actionLoading = false;
        updateBookingInState(state, action.payload.booking);
      })
      .addCase(completeBooking.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // Cancel Booking
    builder
      .addCase(cancelBooking.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.actionLoading = false;
        updateBookingInState(state, action.payload.booking);
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // Rate Booking
    builder
      .addCase(rateBooking.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(rateBooking.fulfilled, (state, action) => {
        state.actionLoading = false;
        updateBookingInState(state, action.payload.booking);
      })
      .addCase(rateBooking.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // Pay for Booking
    builder
      .addCase(payForBooking.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(payForBooking.fulfilled, (state, action) => {
        state.actionLoading = false;
        updateBookingInState(state, action.payload.booking);
      })
      .addCase(payForBooking.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

// Helper function to update booking in state
const updateBookingInState = (state, updatedBooking) => {
  const index = state.bookings.findIndex((b) => b._id === updatedBooking._id);
  if (index !== -1) {
    state.bookings[index] = updatedBooking;
  }
  if (state.selectedBooking?._id === updatedBooking._id) {
    state.selectedBooking = updatedBooking;
  }
};

export const { clearError, setSelectedBooking, clearSelectedBooking } =
  bookingSlice.actions;
export default bookingSlice.reducer;
