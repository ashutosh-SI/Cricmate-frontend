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
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHighlights.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchHighlights.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchHighlights.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

// Selectors
export const selectHighlightsItems = (state) => state.highlights.items;
export const selectHighlightsStatus = (state) => state.highlights.status;
export const selectHighlightsError = (state) => state.highlights.error;

export default highlightsSlice.reducer;
