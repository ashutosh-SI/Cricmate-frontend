import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addUserMessage,
  sendChatMessage,
  selectChatMessages,
  selectChatStatus,
} from '../features/chat/chatSlice.js';
import ManualCommentaryPanel from './ManualCommentaryPanel.jsx';
import { selectSelectedIds } from '../features/commentary/commentarySlice.js';
import './ChatWidget.css';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const dispatch = useDispatch();
  const messages = useSelector(selectChatMessages);
  const status = useSelector(selectChatStatus);
  const selectedIds = useSelector(selectSelectedIds);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    dispatch(addUserMessage(input));
    dispatch(sendChatMessage({ message: input }));
    setInput('');
  };

  return (
    <>
      {/* Floating Button */}
      <button className="chat-button" onClick={toggleOpen}>
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`message-row ${msg.from === 'user' ? 'user' : 'bot'}`}
              >
                {msg.from === 'bot' && (
                  <img className="avatar" src={msg.avatar} alt="bot" />
                )}
                <div className={`bubble ${msg.from === 'user' ? 'user' : 'bot'}`}>{msg.text}</div>
              </div>
            ))}
            {status === 'loading' && (
              <div className="typing">
                <span></span><span></span><span></span>
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
            />
            <button type="submit">
              Send
            </button>
          </form>
        </div>
      )}

      {isOpen && selectedIds.length > 0 && <ManualCommentaryPanel />}
    </>
  );
};

export default ChatWidget;