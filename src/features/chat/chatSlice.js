import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

const CHAT_ENDPOINT = '/chat';

export const sendChatMessage = createAsyncThunk(
  'chat/sendChatMessage',
  async ({ message }, { getState }) => {
    const state = getState();
    const sessionId = state.chat.sessionId;

    const response = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({ message, session_id: sessionId }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chat response');
    }

    const data = await response.json();
    return data;
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    sessionId: uuidv4(),
    messages: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    addUserMessage: (state, action) => {
      state.messages.push({ from: 'user', text: action.payload });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const avatarUrl = `https://api.dicebear.com/8.x/identicon/svg?seed=${Date.now()}${Math.random()}`;
        state.messages.push({ from: 'bot', text: action.payload.reply, avatar: avatarUrl });
        state.sessionId = action.payload.session_id || state.sessionId;
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { addUserMessage } = chatSlice.actions;
export const selectChatMessages = (state) => state.chat.messages;
export const selectChatStatus = (state) => state.chat.status;
export const selectChatError = (state) => state.chat.error;

export default chatSlice.reducer;