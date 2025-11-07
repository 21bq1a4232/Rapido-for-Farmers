import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tractorAPI } from '../../services/api';

// Async thunks
export const fetchNearbyTractors = createAsyncThunk(
  'tractors/fetchNearby',
  async ({ lat, lng, radius }, { rejectWithValue }) => {
    try {
      const response = await tractorAPI.getNearbyTractors(lat, lng, radius);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTractorById = createAsyncThunk(
  'tractors/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await tractorAPI.getTractorById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyTractors = createAsyncThunk(
  'tractors/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tractorAPI.getMyTractors();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createTractor = createAsyncThunk(
  'tractors/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await tractorAPI.createTractor(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTractor = createAsyncThunk(
  'tractors/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await tractorAPI.updateTractor(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTractor = createAsyncThunk(
  'tractors/delete',
  async (id, { rejectWithValue }) => {
    try {
      await tractorAPI.deleteTractor(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  nearbyTractors: [],
  myTractors: [],
  selectedTractor: null,
  loading: false,
  error: null,
  searchLocation: null,
};

// Slice
const tractorSlice = createSlice({
  name: 'tractors',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedTractor: (state, action) => {
      state.selectedTractor = action.payload;
    },
    clearSelectedTractor: (state) => {
      state.selectedTractor = null;
    },
    setSearchLocation: (state, action) => {
      state.searchLocation = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Nearby Tractors
    builder
      .addCase(fetchNearbyTractors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNearbyTractors.fulfilled, (state, action) => {
        state.loading = false;
        state.nearbyTractors = action.payload.tractors || [];
        state.searchLocation = action.payload.searchLocation;
      })
      .addCase(fetchNearbyTractors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Tractor By ID
    builder
      .addCase(fetchTractorById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTractorById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTractor = action.payload.tractor;
      })
      .addCase(fetchTractorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch My Tractors
    builder
      .addCase(fetchMyTractors.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyTractors.fulfilled, (state, action) => {
        state.loading = false;
        state.myTractors = action.payload.tractors || [];
      })
      .addCase(fetchMyTractors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create Tractor
    builder
      .addCase(createTractor.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTractor.fulfilled, (state, action) => {
        state.loading = false;
        state.myTractors.unshift(action.payload.tractor);
      })
      .addCase(createTractor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Tractor
    builder
      .addCase(updateTractor.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTractor.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.myTractors.findIndex(
          (t) => t._id === action.payload.tractor._id
        );
        if (index !== -1) {
          state.myTractors[index] = action.payload.tractor;
        }
      })
      .addCase(updateTractor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Tractor
    builder
      .addCase(deleteTractor.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteTractor.fulfilled, (state, action) => {
        state.loading = false;
        state.myTractors = state.myTractors.filter(
          (t) => t._id !== action.payload
        );
      })
      .addCase(deleteTractor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setSelectedTractor, clearSelectedTractor, setSearchLocation } =
  tractorSlice.actions;
export default tractorSlice.reducer;
