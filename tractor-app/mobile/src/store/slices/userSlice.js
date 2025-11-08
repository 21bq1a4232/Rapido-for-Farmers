import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userAPI, paymentAPI } from '../../services/api';

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userAPI.getProfile();
      return response.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (data, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateProfile(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchWalletBalance = createAsyncThunk(
  'user/fetchWalletBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userAPI.getWalletBalance();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchWalletSummary = createAsyncThunk(
  'user/fetchWalletSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getWalletSummary();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addMoneyToWallet = createAsyncThunk(
  'user/addMoney',
  async (amount, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.addMoneyToWallet(amount);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'user/verifyPayment',
  async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.verifyPayment(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPaymentHistory = createAsyncThunk(
  'user/fetchPaymentHistory',
  async (params, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getPaymentHistory(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  profile: null,
  walletBalance: 0,
  walletSummary: null,
  paymentHistory: [],
  loading: false,
  error: null,
  paymentOrder: null, // For Razorpay order
};

// Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPaymentOrder: (state) => {
      state.paymentOrder = null;
    },
    updateWalletBalance: (state, action) => {
      state.walletBalance = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch User Profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.walletBalance = action.payload.wallet || 0;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Wallet Balance
    builder
      .addCase(fetchWalletBalance.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWalletBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.walletBalance = action.payload.wallet;
      })
      .addCase(fetchWalletBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Wallet Summary
    builder
      .addCase(fetchWalletSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWalletSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.walletBalance = action.payload.currentBalance;
        state.walletSummary = action.payload.summary;
      })
      .addCase(fetchWalletSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add Money to Wallet
    builder
      .addCase(addMoneyToWallet.pending, (state) => {
        state.loading = true;
      })
      .addCase(addMoneyToWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentOrder = action.payload.order;
      })
      .addCase(addMoneyToWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Verify Payment
    builder
      .addCase(verifyPayment.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.walletBalance = action.payload.user.wallet;
        state.paymentOrder = null;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Payment History
    builder
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentHistory = action.payload.payments || [];
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearPaymentOrder, updateWalletBalance } = userSlice.actions;
export default userSlice.reducer;
