import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectSelectedIds,
  selectManual,
  selectAllCommentary,
  setManualCommentary,
} from '../features/commentary/commentarySlice.js';
import './ManualCommentaryPanel.css';

const ManualCommentaryPanel = () => {
  const dispatch = useDispatch();
  const selectedIds = useSelector(selectSelectedIds);
  const manual = useSelector(selectManual);
  const commentary = useSelector(selectAllCommentary);

  const [localMap, setLocalMap] = useState({});

  useEffect(() => {
    // sync when selection changes
    const init = {};
    selectedBalls.forEach((b) => {
      init[b.index] = manual[b.index] || '';
    });
    setLocalMap(init);
  }, [selectedIds]);

  const handleLocalChange = (index, value) => {
    setLocalMap((prev) => ({ ...prev, [index]: value }));
  };

  const handleSave = (index) => {
    dispatch(setManualCommentary({ index, text: localMap[index] }));
  };

  if (selectedIds.length === 0) return null;

  const selectedBalls = commentary.filter((ball) => selectedIds.includes(ball.index));

  return (
    <div className="manual-panel">
      <h4>Manual Commentary</h4>
      {selectedBalls.map((ball) => (
        <div key={ball.index} style={{ marginBottom: '0.75rem' }}>
          <label style={{ fontWeight: 600 }}>Over {ball.displayover.toFixed(1)}</label>
          <textarea
            value={localMap[ball.index] || ''}
            onChange={(e) => handleLocalChange(ball.index, e.target.value)}
            rows={3}
            style={{ width: '100%', marginTop: '0.25rem' }}
          />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            <button
              onClick={() => handleSave(ball.index)}
              disabled={localMap[ball.index] === (manual[ball.index] || '')}
            >
              Save
            </button>
            <button
              onClick={() => handleLocalChange(ball.index, manual[ball.index] || '')}
              disabled={localMap[ball.index] === (manual[ball.index] || '')}
            >
              Cancel
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ManualCommentaryPanel;