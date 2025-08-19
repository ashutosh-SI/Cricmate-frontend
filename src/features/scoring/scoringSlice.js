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
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchScoring.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchScoring.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchScoring.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectScoringItems = (state) => state.scoring.items;
export const selectScoringStatus = (state) => state.scoring.status;
export const selectScoringError = (state) => state.scoring.error;

export default scoringSlice.reducer;