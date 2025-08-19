import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchScoring,
  selectScoringItems,
  selectScoringStatus,
} from '../features/scoring/scoringSlice.js';
import './ScoringInterface.css';


const ScoringInterface = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const items = useSelector(selectScoringItems);
  const status = useSelector(selectScoringStatus);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchScoring());
  }, [status, dispatch]);

  const entry = items.find((it) => String(it.index) === id);

  if (status === 'loading') return <p>Loading…</p>;
  if (!entry) return <p>No data found.</p>;

  const sd = entry.scoring_data[0];

  const renderObj = (obj, level = 0) => {
    return Object.entries(obj).map(([k, v]) => {
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        return (
          <div key={k} style={{ marginLeft: level * 12 }}>
            <strong>{k}</strong>
            {renderObj(v, level + 1)}
          </div>
        );
      }
      return (
        <div key={k} style={{ marginLeft: level * 12 }}>
          <span className="label">{k}: </span>
          <span>{String(v)}</span>
        </div>
      );
    });
  };

  return (
    <div className="scoring-interface-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <h2>
        Over {entry.displayover.toFixed(1)} – {sd.Commentary.Event}
      </h2>

      {Object.entries(sd).map(([section, value]) => (
        <div className="section data-card" key={section}>
          <h3>{section}</h3>
          {renderObj(value)}
        </div>
      ))}
    </div>
  );
};

export default ScoringInterface;