import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchCommentary = createAsyncThunk(
  'commentary/fetchCommentary',
  async () => {
    const response = await fetch('/api/aicommentary');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.data || [];
  }
);

const commentarySlice = createSlice({
  name: 'commentary',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
    selectedIds: [],
    manual: {}, // key: index, value: text
    refreshing: false,
  },
  reducers: {
    toggleSelect: (state, action) => {
      const id = action.payload;
      if (state.selectedIds.includes(id)) {
        state.selectedIds = state.selectedIds.filter((i) => i !== id);
      } else {
        state.selectedIds.push(id);
      }
    },
    setManualCommentary: (state, action) => {
      const { index, text } = action.payload;
      state.manual[index] = text;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommentary.pending, (state) => {
        if (state.status === 'idle') {
          state.status = 'loading';
        } else {
          state.refreshing = true;
        }
      })
      .addCase(fetchCommentary.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
        state.refreshing = false;
      })
      .addCase(fetchCommentary.rejected, (state, action) => {
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

export const selectAllCommentary = (state) => state.commentary.items;
export const selectStatus = (state) => state.commentary.status;
export const selectError = (state) => state.commentary.error;
export const selectSelectedIds = (state) => state.commentary.selectedIds;
export const selectManual = (state) => state.commentary.manual;
export const selectCommentaryRefreshing = (state) => state.commentary.refreshing;

export const { toggleSelect, setManualCommentary } = commentarySlice.actions;

export default commentarySlice.reducer;