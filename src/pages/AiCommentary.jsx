import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence, stagger } from 'framer-motion';
import {
  fetchCommentary,
  selectAllCommentary,
  selectStatus,
  selectError,
  toggleSelect,
  selectSelectedIds,
  selectManual,
  setManualCommentary,
} from '../features/commentary/commentarySlice.js';
import ChatWidget from '../components/ChatWidget.jsx';
import './AiCommentary.css';
import editIcon from '../assets/edit-246.svg';
import checkIcon from '../assets/checkmark-1.svg';

const AiCommentary = () => {
  const dispatch = useDispatch();
  const commentary = useSelector(selectAllCommentary);
  const status = useSelector(selectStatus);
  const error = useSelector(selectError);
  const POLL_INTERVAL_MS = 5000;
  const selectedIds = useSelector(selectSelectedIds);
  const manual = useSelector(selectManual);

  // track per-card language selection: default english
  const [langMap, setLangMap] = useState({});
  const [editingMap, setEditingMap] = useState({});
  const [visibleCards, setVisibleCards] = useState([]);

  const languages = [
    { key: 'english', label: 'EN' },
    { key: 'hindi', label: 'HI' },
    { key: 'marathi', label: 'MR' },
    { key: 'hinglish', label: 'HN' },
  ];

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCommentary());
    }
  }, [status, dispatch]);

  // Polling
  useEffect(() => {
    if (status !== 'failed') {
      const id = setInterval(() => {
        dispatch(fetchCommentary());
      }, POLL_INTERVAL_MS);
      return () => clearInterval(id);
    }
  }, [status, dispatch]);

  const sortedCommentary = [...commentary].sort((a, b) => a.displayover - b.displayover);

  // Staggered card reveal
  useEffect(() => {
    if (status === 'succeeded' && sortedCommentary.length > 0) {
      setVisibleCards([]);
      sortedCommentary.forEach((_, index) => {
        setTimeout(() => {
          setVisibleCards(prev => [...prev, index]);
        }, index * 150); // 150ms stagger
      });
    }
  }, [status, sortedCommentary.length]);

  if (status === 'loading') {
    return (
      <div className="feed-container">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="feed-title"
        >
          AI Commentary Feed
        </motion.h2>
        <div className="loading-container">
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p>Loading commentary...</p>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="feed-container">
        <h2 className="feed-title">AI Commentary Feed</h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="error-message"
        >
          Error: {error}
        </motion.p>
      </div>
    );
  }

  return (
    <>
      <div className="feed-container">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="feed-title"
        >
          AI Commentary Feed
        </motion.h2>
        <div className="commentary-cards">
          <AnimatePresence>
            {sortedCommentary.map((ball, index) => {
              const currentLang = langMap[ball.index] || 'english';
              const displayText = ball[currentLang];
              const isEditing = editingMap[ball.index] === true;
              const isVisible = visibleCards.includes(index);
              
              if (!isVisible) return null;
              
              return (
                <motion.div
                  key={ball.index}
                  className={`commentary-card ${selectedIds.includes(ball.index) ? 'selected' : ''}`}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ 
                    duration: 0.5,
                    type: "spring",
                    stiffness: 100 
                  }}
                  whileHover={{ 
                    y: -2,
                    transition: { duration: 0.2 }
                  }}
                  onClick={() => dispatch(toggleSelect(ball.index))}
                >
                  <motion.img
                    src={editIcon}
                    alt="edit"
                    className="edit-icon"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingMap((prev) => ({ ...prev, [ball.index]: !prev[ball.index] }));
                    }}
                  />
                  <AnimatePresence>
                    {isEditing && (manual[ball.index] || '')?.trim() && (
                      <motion.img
                        src={checkIcon}
                        alt="save"
                        className="check-icon"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingMap((prev) => ({ ...prev, [ball.index]: false }));
                        }}
                      />
                    )}
                  </AnimatePresence>
                  
                  <motion.div 
                    className="card-header"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="over">Over {ball.displayover.toFixed(1)}</span>
                    <motion.span 
                      className="event"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                    >
                      {ball.event}
                    </motion.span>
                  </motion.div>
                  
                  <motion.div 
                    className="lang-filters"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {languages.map((lang, langIndex) => (
                      <motion.button
                        key={lang.key}
                        className={currentLang === lang.key ? 'active' : ''}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + langIndex * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setLangMap((prev) => ({ ...prev, [ball.index]: lang.key }));
                        }}
                      >
                        {lang.label}
                      </motion.button>
                    ))}
                  </motion.div>
                  
                  <motion.div 
                    className="card-body"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <AnimatePresence mode="wait">
                      {isEditing ? (
                        <motion.textarea
                          key="editing"
                          className="manual-input"
                          value={manual[ball.index] || ''}
                          rows={3}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => dispatch(setManualCommentary({ index: ball.index, text: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              setEditingMap((prev) => ({ ...prev, [ball.index]: false }));
                            }
                          }}
                        />
                      ) : (
                        <motion.div
                          key="display"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {manual[ball.index] && (
                            <motion.p 
                              className="manual-text"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                            >
                              <strong>Manual:</strong> {manual[ball.index]}
                            </motion.p>
                          )}
                          <motion.p
                            key={currentLang}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {displayText}
                          </motion.p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
      <ChatWidget />
    </>
  );
};

export default AiCommentary;