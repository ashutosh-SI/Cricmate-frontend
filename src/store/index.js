import { configureStore } from '@reduxjs/toolkit';
import commentaryReducer from '../features/commentary/commentarySlice.js';
import chatReducer from '../features/chat/chatSlice.js';
import scoringReducer from '../features/scoring/scoringSlice.js';
import highlightsReducer from '../features/highlights/highlightsSlice.js';

export const store = configureStore({
  reducer: {
    commentary: commentaryReducer,
    chat: chatReducer,
    scoring: scoringReducer,
    highlights: highlightsReducer,
  },
});

export default store;