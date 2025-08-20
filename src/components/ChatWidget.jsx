import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bot, User, X, Maximize2 } from 'lucide-react';
import {
  addUserMessage,
  sendChatMessage,
  selectChatMessages,
  selectChatStatus,
} from '../features/chat/chatSlice.js';

import './ChatWidget.css';

// Function to format bot messages
const formatBotMessage = (text) => {
  if (!text) return '';
  
  // Split text into lines for processing
  const lines = text.split('\n');
  const formattedLines = [];
  
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    
    // Headers (### or ####)
    if (line.startsWith('####')) {
      formattedLines.push(`<h4 class="bot-h4">${line.replace(/####\s*/, '')}</h4>`);
    } else if (line.startsWith('###')) {
      formattedLines.push(`<h3 class="bot-h3">${line.replace(/###\s*/, '')}</h3>`);
    }
    // Bold text (**text**)
    else if (line.includes('**')) {
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      formattedLines.push(`<p class="bot-text">${formatted}</p>`);
    }
    // List items (- text)
    else if (line.startsWith('-')) {
      formattedLines.push(`<div class="bot-list-item">${line.replace(/^-\s*/, '• ')}</div>`);
    }
    // Regular text
    else {
      formattedLines.push(`<p class="bot-text">${line}</p>`);
    }
  }
  
  return formattedLines.join('');
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const dispatch = useDispatch();
  const messages = useSelector(selectChatMessages);
  const status = useSelector(selectChatStatus);

  const toggleOpen = () => {
    if (isOpen) {
      // Start closing animation
      setIsClosing(true);
      // Hide window after animation completes
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
        setIsExpanded(false); // Reset expanded state when closing
      }, 400); // Match the closing animation duration
    } else {
      // Open immediately
      setIsOpen(true);
      setIsClosing(false);
      setIsExpanded(false); // Ensure clean state when opening
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || status === 'loading') return;
    dispatch(addUserMessage(input));
    dispatch(sendChatMessage({ message: input }));
    setInput('');
  };

  const handleQuickAction = (message) => {
    if (status === 'loading') return;
    dispatch(addUserMessage(message));
    dispatch(sendChatMessage({ message: message }));
  };

  return (
    <>
      {/* Floating Button - Hidden when chat is open */}
      {!isOpen && (
        <button className="chat-button" onClick={toggleOpen}>
          🏏
        </button>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className={`chat-backdrop ${isClosing ? 'closing' : ''}`} 
          onClick={!isExpanded ? toggleOpen : undefined}
        ></div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`chat-window ${isExpanded ? 'expanded' : ''} ${isClosing ? 'closing' : ''}`}>
          {/* Header Section */}
          <div className="chat-header">
            <div className="header-info">
              <div className="ai-icon">🏏</div>
              <div className="header-text">
                <h3 className="header-title">CricketAI Assistant</h3>
                <p className="header-subtitle">Your AI-powered cricket companion</p>
              </div>
            </div>
            <div className="header-actions">
              <button className="header-btn" onClick={toggleExpanded} title={isExpanded ? "Minimize" : "Expand"}>
                <Maximize2 size={16} />
              </button>
              <button className="header-btn" onClick={toggleOpen} title="Close">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="quick-actions">
            <button 
              className={`action-btn ${status === 'loading' ? 'disabled' : ''}`}
              onClick={() => handleQuickAction('👤 Virat Kohli Fours')}
              disabled={status === 'loading'}
            >
              👤 Virat Kohli Fours
            </button>
            <button 
              className={`action-btn ${status === 'loading' ? 'disabled' : ''}`}
              onClick={() => handleQuickAction('👤 Rohit Sharma Highest score')}
              disabled={status === 'loading'}
            >
              👤 Rohit Sharma Highest score
            </button>
            <button 
              className={`action-btn ${status === 'loading' ? 'disabled' : ''}`}
              onClick={() => handleQuickAction('🏆 India vs Australia Final 2023')}
              disabled={status === 'loading'}
            >
              🏆 India vs Australia Final 2023
            </button>
          </div>

          <div className="messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`message-row ${msg.from === 'user' ? 'user' : 'bot'}`}
              >
                {msg.from === 'bot' ? (
                  <div className="avatar bot-avatar">
                    <Bot size={18} />
                  </div>
                ) : (
                  <div className="avatar user-avatar">
                    <User size={18} />
                  </div>
                )}
                <div className={`bubble ${msg.from === 'user' ? 'user' : 'bot'}`}>
                  {msg.from === 'bot' ? (
                    <div dangerouslySetInnerHTML={{ __html: formatBotMessage(msg.text) }} />
                  ) : (
                    msg.text
                  )}
                </div>
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
              placeholder={status === 'loading' ? "Processing..." : "Type a message…"}
              disabled={status === 'loading'}
            />
            <button 
              type="submit" 
              disabled={status === 'loading' || !input.trim()}
              className={status === 'loading' ? 'disabled' : ''}
            >
              {status === 'loading' ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;