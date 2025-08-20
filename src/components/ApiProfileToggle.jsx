import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toggleApiMode, getApiMode } from '../utils/apiSwitcher.js';
import { fetchCommentary } from '../features/commentary/commentarySlice.js';
import { fetchHighlights } from '../features/highlights/highlightsSlice.js';
import { fetchScoring } from '../features/scoring/scoringSlice.js';

const ApiProfileToggle = () => {
  const dispatch = useDispatch();
  const [apiMode, setApiMode] = useState(getApiMode());

  useEffect(() => {
    setApiMode(getApiMode());
  }, []);

  const onToggle = () => {
    const next = toggleApiMode();
    setApiMode(next);
    // Immediately refresh core data so UI updates without manual reload
    dispatch(fetchCommentary());
    dispatch(fetchHighlights());
    dispatch(fetchScoring());
  };

  return (
    <div className="top-right-actions">
      <button className={`profile-toggle ${apiMode}`} title={`API: ${apiMode}`} onClick={onToggle}>
        <span className="profile-emoji">👤</span>
      </button>
    </div>
  );
};

export default ApiProfileToggle;


