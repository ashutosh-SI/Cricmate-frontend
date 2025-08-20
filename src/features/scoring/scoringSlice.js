import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchScoring = createAsyncThunk('scoring/fetchScoring', async () => {
  const res = await fetch('/api/scoring');
  if (!res.ok) {
    throw new Error('Failed to fetch scoring data');
  }
  const data = await res.json();
  return data.data || [];
});

const scoringSlice = createSlice({
  name: 'scoring',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
    refreshing: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchScoring.pending, (state) => {
        if (state.status === 'idle') {
          state.status = 'loading';
        } else {
          state.refreshing = true;
        }
      })
      .addCase(fetchScoring.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
        state.refreshing = false;
      })
      .addCase(fetchScoring.rejected, (state, action) => {
        if (state.status === 'idle') {
          state.status = 'failed';
        } else {
          state.status = 'succeeded';
        }
        state.error = action.error.message;
        state.refreshing = false;
      });
  },
});

export const selectScoringItems = (state) => state.scoring.items;
export const selectScoringStatus = (state) => state.scoring.status;
export const selectScoringError = (state) => state.scoring.error;
export const selectScoringRefreshing = (state) => state.scoring.refreshing;

export default scoringSlice.reducer;