import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI, userAPI, setAuthToken, removeAuthToken, saveUser } from '../../services/api';

// Async thunks
export const sendOTP = createAsyncThunk(
  'auth/sendOTP',
  async (phone, { rejectWithValue }) => {
    try {
      const response = await authAPI.sendOTP(phone);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ phone, otp }, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyOTP(phone, otp);
      // Save token and user
      await setAuthToken(response.token);
      await saveUser(response.user);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getMe();
      await saveUser(response.user);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await removeAuthToken();
    return null;
  }
);

export const resendOTP = createAsyncThunk(
  'auth/resendOTP',
  async (phone, { rejectWithValue }) => {
    try {
      const response = await authAPI.resendOTP(phone);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'auth/updateUserRole',
  async (role, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateProfile({ role });
      await saveUser(response.user);
      return response.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  needsRoleSelection: false, // Track if user needs to select role
  loading: false,
  error: null,
  otpSent: false,
};

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    updateUserRole: (state, action) => {
      if (state.user) {
        state.user.role = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Send OTP
    builder
      .addCase(sendOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.otpSent = false;
      })
      .addCase(sendOTP.fulfilled, (state) => {
        state.loading = false;
        state.otpSent = true;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.otpSent = false;
      });

    // Verify OTP
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        
        // Check if user needs role selection
        const userHasRole = action.payload.user.role && action.payload.user.role.length > 0;
        state.isAuthenticated = userHasRole; // Only fully authenticated if user has role
        state.needsRoleSelection = !userHasRole; // Need role selection if user has no role
        state.otpSent = false;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Me
    builder
      .addCase(getMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        
        // Check if user needs role selection
        const userHasRole = action.payload.user.role && action.payload.user.role.length > 0;
        state.isAuthenticated = userHasRole; // Only fully authenticated if user has role
        state.needsRoleSelection = !userHasRole; // Need role selection if user has no role
      })
      .addCase(getMe.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.needsRoleSelection = false;
      });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.needsRoleSelection = false;
      state.otpSent = false;
    });

    // Resend OTP
    builder
      .addCase(resendOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendOTP.fulfilled, (state) => {
        state.loading = false;
        state.otpSent = true;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update User Role
    builder
      .addCase(updateUserRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        
        // After user selects role, they are fully authenticated
        state.isAuthenticated = true;
        state.needsRoleSelection = false;
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
