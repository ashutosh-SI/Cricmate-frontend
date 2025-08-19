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
        state.status = 'loading';
      })
      .addCase(fetchCommentary.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCommentary.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectAllCommentary = (state) => state.commentary.items;
export const selectStatus = (state) => state.commentary.status;
export const selectError = (state) => state.commentary.error;
export const selectSelectedIds = (state) => state.commentary.selectedIds;
export const selectManual = (state) => state.commentary.manual;

export const { toggleSelect, setManualCommentary } = commentarySlice.actions;

export default commentarySlice.reducer;