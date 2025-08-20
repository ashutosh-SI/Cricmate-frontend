import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to fetch highlights data
export const fetchHighlights = createAsyncThunk(
  'highlights/fetchHighlights',
  async () => {
    const response = await fetch('/api/highlights');
    const data = await response.json();
    return data.data;
  }
);

const highlightsSlice = createSlice({
  name: 'highlights',
  initialState: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    refreshing: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHighlights.pending, (state) => {
        if (state.status === 'idle') {
          state.status = 'loading';
        } else {
          state.refreshing = true;
        }
      })
      .addCase(fetchHighlights.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
        state.refreshing = false;
      })
      .addCase(fetchHighlights.rejected, (state, action) => {
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

// Selectors
export const selectHighlightsItems = (state) => state.highlights.items;
export const selectHighlightsStatus = (state) => state.highlights.status;
export const selectHighlightsError = (state) => state.highlights.error;
export const selectHighlightsRefreshing = (state) => state.highlights.refreshing;

export default highlightsSlice.reducer;
