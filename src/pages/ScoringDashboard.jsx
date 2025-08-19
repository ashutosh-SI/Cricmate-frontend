import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchScoring,
  selectScoringItems,
  selectScoringStatus,
  selectScoringError,
} from '../features/scoring/scoringSlice.js';
import './ScoringDashboard.css';
import ReactPlayer from 'react-player';

const ScoringDashboard = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectScoringItems);
  const [modalUrl, setModalUrl] = useState(null);
  const [loadedVideos, setLoadedVideos] = useState(new Set());
  const status = useSelector(selectScoringStatus);
  const error = useSelector(selectScoringError);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchScoring());
    }
  }, [status, dispatch]);

  if (status === 'loading') return <p>Loading scoring data…</p>;
  if (status === 'failed') return <p>Error: {error}</p>;

  return (
    <div className="scoring-container">
      <h2>Scoring Dashboard</h2>
      <div className="scoring-cards">
        {items.map((entry) => {
          const sd = entry.scoring_data?.[0] || {};
          const batting = sd.BattingParameters || {};
          const onStrike = batting.OnStrike || {};
          const nonStriker = batting.NonStriker || {};
          const bowler = sd.BowlingParameters?.Bowler || {};

          return (
            <div className="scoring-card" key={entry.index}>
              <div
                className="video-wrapper"
                onClick={() => setModalUrl(entry.video)}
              >
                <span className="play-overlay">▶</span>
                {!loadedVideos.has(entry.index) && (
                  <div className="video-skeleton" />
                )}
                <video
                  src={entry.video}
                  preload="metadata"
                  muted
                  playsInline
                  onLoadedData={() =>
                    setLoadedVideos((prev) => new Set(prev).add(entry.index))
                  }
                  style={{ opacity: loadedVideos.has(entry.index) ? 1 : 0 }}
                />
              </div>
              <div className="score-info">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <h3 style={{margin:0}}>
                    Over {entry.displayover.toFixed(1)} – {entry.event}
                  </h3>
                  <Link className="view-scoring" to={`/scoring/${entry.index}`}>View Scoring</Link>
                </div>
                <p>
                  <strong>Batter:</strong> {onStrike.batsname}
                </p>
                <p>
                  <strong>Non-Striker:</strong> {nonStriker.nonstrikername}
                </p>
                <p>
                  <strong>Bowler:</strong> {bowler.bowlername}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {modalUrl && (
        <div className="modal-overlay" onClick={() => setModalUrl(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalUrl(null)}>
              ×
            </button>
            <ReactPlayer url={modalUrl} controls width="100%" height="auto" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoringDashboard;