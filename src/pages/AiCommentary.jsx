import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  const selectedIds = useSelector(selectSelectedIds);
  const manual = useSelector(selectManual);

  // track per-card language selection: default english
  const [langMap, setLangMap] = useState({});
  const [editingMap, setEditingMap] = useState({});

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

  if (status === 'loading') {
    return <p>Loading commentary...</p>;
  }

  if (status === 'failed') {
    return <p>Error: {error}</p>;
  }

  const sortedCommentary = [...commentary].sort((a, b) => a.displayover - b.displayover);

  return (
    <>
      <div className="feed-container">
      <h2>AI Commentary Feed</h2>
      <div className="commentary-cards">
        {sortedCommentary.map((ball) => {
          const currentLang = langMap[ball.index] || 'english';
          const displayText = ball[currentLang];
          const isEditing = editingMap[ball.index] === true;
          return (
            <div
              className={`commentary-card ${selectedIds.includes(ball.index) ? 'selected' : ''}`}
              key={ball.index}
              onClick={() => dispatch(toggleSelect(ball.index))}
              >
              <img
                src={editIcon}
                alt="edit"
                className="edit-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingMap((prev) => ({ ...prev, [ball.index]: !prev[ball.index] }));
                }}
              />
              {isEditing && (manual[ball.index] || '')?.trim() && (
                <img
                  src={checkIcon}
                  alt="save"
                  className="check-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingMap((prev) => ({ ...prev, [ball.index]: false }));
                  }}
                />
              )}
              <div className="card-header">
                <span className="over">Over {ball.displayover.toFixed(1)}</span>
                <span className="event">{ball.event}</span>
              </div>
              <div className="lang-filters">
                {languages.map((lang) => (
                  <button
                    key={lang.key}
                    className={currentLang === lang.key ? 'active' : ''}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLangMap((prev) => ({ ...prev, [ball.index]: lang.key }));
                    }}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
              <div className="card-body">
              {isEditing ? (
                <textarea
                  className="manual-input"
                  value={manual[ball.index] || ''}
                  rows={3}
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
                manual[ball.index] && (
                  <p className="manual-text"><strong>Manual:</strong> {manual[ball.index]}</p>
                )
              )}

              <p>{displayText}</p>
              </div>
            </div>
          );
        })}
      </div>
      </div>
      <ChatWidget />
    </>
  );
};

export default AiCommentary;