import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchScoring,
  selectScoringItems,
  selectScoringStatus,
  selectScoringError,
} from '../features/scoring/scoringSlice.js';
import './ScoringDashboard.css';
import ReactPlayer from 'react-player';
import pitchImg from '../assets/pitch-map.png';

const ScoringDashboard = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectScoringItems);
  const [modalUrl, setModalUrl] = useState(null);
  const [currentVideoItem, setCurrentVideoItem] = useState(null); // Current video's scoring data
  const [showOverlay, setShowOverlay] = useState(false); // Overlay visibility
  const [overlayType, setOverlayType] = useState(null); // Type of overlay to show
  const [showBatsmanStats, setShowBatsmanStats] = useState(false); // Batsman stats loading state
  
  // Ref to track overlay state without causing re-renders
  const overlayActiveRef = useRef(false);

  // Function to convert text to Pascal case (Title Case)
  const toPascalCase = (text) => {
    if (!text) return text;
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  const [loadedVideos, setLoadedVideos] = useState(new Set());
  const [visibleCards, setVisibleCards] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [seeking, setSeeking] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const playerRef = useRef(null);
  const status = useSelector(selectScoringStatus);
  const error = useSelector(selectScoringError);
  const POLL_INTERVAL_MS = 5000; // 5s polling

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchScoring());
    }
  }, [status, dispatch]);

  // Polling for frequent updates
  useEffect(() => {
    if (status !== 'failed') {
      const intervalId = setInterval(() => {
        dispatch(fetchScoring());
      }, POLL_INTERVAL_MS);
      return () => clearInterval(intervalId);
    }
  }, [status, dispatch]);

  // Staggered card reveal
  useEffect(() => {
    if (status === 'succeeded' && items.length > 0) {
      setVisibleCards([]);
      items.forEach((_, index) => {
        setTimeout(() => {
          setVisibleCards(prev => [...prev, index]);
        }, index * 120); // 120ms stagger for faster reveals
      });
    }
  }, [status, items.length]);

  // Video control handlers
  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleProgress = (state) => {
    if (!seeking) {
      setPlayed(state.played);
    }
  };
  const handleDuration = (duration) => {
    setDuration(duration);
    setVideoLoading(false);
    setVideoReady(true);
  };
  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    setSeeking(true);
    setPlayed(pos);
    if (playerRef.current) {
      playerRef.current.seekTo(pos, 'fraction');
    }
    // Reset seeking after a short delay to allow the player to update
    setTimeout(() => setSeeking(false), 100);
  };
  const handleVolumeChange = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const vol = (e.clientX - rect.left) / rect.width;
    setVolume(vol);
    setIsMuted(vol === 0);
  };
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) setVolume(0);
    else setVolume(0.8);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Batsman Overlay Component with Loading States
  const BatsmanOverlay = ({ batsmanData, event, showStats = false }) => (
    <div className="scoring-overlay batsman-overlay compact">
      <div className="overlay-header">
        <span className="overlay-title">🏏 ON STRIKE</span>
        <div className="overlay-header-right">
          <span className="overlay-event">{event}</span>
          <button 
            className="overlay-close-btn"
            onClick={() => {
              setShowOverlay(false);
              setOverlayType(null);
              overlayActiveRef.current = false;
            }}
          >
            ×
          </button>
        </div>
      </div>
      
      <div className="overlay-content">
        <div className="player-main">
          <div className="player-name-large">
            {batsmanData?.batsname || 'Unknown Batsman'}
          </div>
          <div className="player-position">
            {batsmanData?.Pos && batsmanData.Pos.trim() && batsmanData.Pos !== 'null' 
              ? (isNaN(batsmanData.Pos) ? batsmanData.Pos : `Position #${batsmanData.Pos}`)
              : 'On Strike'
            }
          </div>
        </div>
        
        <div className="player-stats-grid">
          <div className="stat-item">
            <span className="stat-label">Runs</span>
            {showStats ? (
              <span className="stat-value">{batsmanData?.R || '0'}</span>
            ) : (
              <div className="stat-loading">
                <div className="loading-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>
          <div className="stat-item">
            <span className="stat-label">Balls</span>
            {showStats ? (
              <span className="stat-value">{batsmanData?.B || '0'}</span>
            ) : (
              <div className="stat-loading">
                <div className="loading-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>
          <div className="stat-item">
            <span className="stat-label">Fours</span>
            {showStats ? (
              <span className="stat-value">{batsmanData?.F || '0'}</span>
            ) : (
              <div className="stat-loading">
                <div className="loading-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>
          <div className="stat-item">
            <span className="stat-label">S/R</span>
            {showStats ? (
              <span className="stat-value">{batsmanData?.S || '0.00'}</span>
            ) : (
              <div className="stat-loading">
                <div className="loading-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Bowler Overlay Component with Loading States (same pattern as batsman)
  const BowlerOverlayCompact = ({ bowlerData, bowlingStyle, event, showStats = false }) => (
    <div className="scoring-overlay bowler-overlay-compact compact">
      <div className="overlay-header">
        <span className="overlay-title">🥎 BOWLING</span>
        <div className="overlay-header-right">
          <span className="overlay-event">{event}</span>
          <button 
            className="overlay-close-btn"
            onClick={() => {
              setShowOverlay(false);
              setOverlayType(null);
              overlayActiveRef.current = false;
            }}
          >
            ×
          </button>
        </div>
      </div>
      
      <div className="overlay-content">
        <div className="player-main">
          <div className="player-name-large">
            {bowlerData?.bowlername || 'Unknown Bowler'}
          </div>
          <div className="player-position">
            {bowlingStyle && bowlingStyle.trim() && bowlingStyle !== 'null' 
              ? bowlingStyle 
              : 'Fast Medium'
            }
          </div>
        </div>
        
        <div className="player-stats-grid">
          <div className="stat-item">
            <span className="stat-label">Overs</span>
            {showStats ? (
              <span className="stat-value">{bowlerData?.O || '0'}</span>
            ) : (
              <div className="stat-loading">
                <div className="loading-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>
          <div className="stat-item">
            <span className="stat-label">Runs</span>
            {showStats ? (
              <span className="stat-value">{bowlerData?.R || '0'}</span>
            ) : (
              <div className="stat-loading">
                <div className="loading-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>
          <div className="stat-item">
            <span className="stat-label">Wickets</span>
            {showStats ? (
              <span className="stat-value">{bowlerData?.W || '0'}</span>
            ) : (
              <div className="stat-loading">
                <div className="loading-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>
          <div className="stat-item">
            <span className="stat-label">Dots</span>
            {showStats ? (
              <span className="stat-value">{bowlerData?.D || '0'}</span>
            ) : (
              <div className="stat-loading">
                <div className="loading-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Pitch Overlay Component - Simple div without animations
  const PitchOverlay = ({ battingData, event }) => {
    const pitchType = (battingData?.Pitch || '').toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className="scoring-overlay pitch-overlay">
        <div className="overlay-header">
          <span className="overlay-title">🎯 PITCH ANALYSIS</span>
          <div className="overlay-header-right">
            <span className="overlay-event">{event}</span>
            <button 
              className="overlay-close-btn"
              onClick={() => {
                setShowOverlay(false);
                setOverlayType(null);
                overlayActiveRef.current = false;
              }}
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="overlay-content">
          <div className={`pitch-wrapper pitch-${pitchType}`}>
            <img src={pitchImg} className="pitch-img" alt="Cricket Pitch" />
            <div className="highlight good" />
            <div className="highlight full" />
            <div className="highlight yorker" />
            <div className="highlight short-of-good" />
            <div className="highlight short" />
          </div>
          
          <div className="pitch-info">
            <div className="pitch-length">
              <span className="pitch-label">Length:</span>
              <span className="pitch-value">
                {battingData?.Pitch && battingData.Pitch.trim() && battingData.Pitch !== 'null' 
                  ? battingData.Pitch 
                  : 'Good Length'
                }
              </span>
            </div>
            <div className="zone-played">
              <span className="zone-label">Zone:</span>
              <span className="zone-value">
                {battingData?.ZonePlayedIn && battingData.ZonePlayedIn.trim() && battingData.ZonePlayedIn !== 'null' 
                  ? battingData.ZonePlayedIn 
                  : 'Off Side'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Shot Type Overlay Component
  const ShotTypeOverlay = ({ shotData, event }) => (
    <div className="scoring-overlay shot-overlay">
      <div className="overlay-header">
        <span className="overlay-title">🎾 SHOT PLAYED</span>
        <div className="overlay-header-right">
          <span className="overlay-event">{event}</span>
          <button 
            className="overlay-close-btn"
            onClick={() => {
              setShowOverlay(false);
              setOverlayType(null);
              overlayActiveRef.current = false;
            }}
          >
            ×
          </button>
        </div>
      </div>
      
      <div className="overlay-content">
        <div className="shot-main">
          <div className="shot-stroke">
            {shotData?.Stroke && shotData.Stroke.trim() && shotData.Stroke !== 'null' 
              ? shotData.Stroke 
              : 'Defensive Shot'
            }
          </div>
          <div className="shot-type">
            {shotData?.Type && shotData.Type.trim() && shotData.Type !== 'null' 
              ? shotData.Type 
              : 'Standard'
            } • {shotData?.Trace && shotData.Trace.trim() && shotData.Trace !== 'null' 
              ? shotData.Trace 
              : 'Ground'
            }
          </div>
        </div>
        
        <div className="shot-details">
          <div className="shot-detail-item">
            <span className="detail-label">Contact:</span>
            <span className="detail-value">
              {shotData?.Connect && shotData.Connect.trim() && shotData.Connect !== 'null' 
                ? shotData.Connect 
                : 'Middle'
              }
            </span>
          </div>
          <div className="shot-detail-item">
            <span className="detail-label">Position:</span>
            <span className="detail-value">
              {shotData?.CreasePosition && shotData.CreasePosition.trim() && shotData.CreasePosition !== 'null' 
                ? shotData.CreasePosition 
                : 'Front Foot'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Bowler Stats Overlay Component - Simple div without animations
  const BowlerStatsOverlay = ({ bowlerData, bowlingStyle, onStrike, event }) => (
    <div className="scoring-overlay bowler-overlay">
      <div className="overlay-header">
        <span className="overlay-title">🥎 BOWLER STATS</span>
        <div className="overlay-header-right">
          <span className="overlay-event">{event}</span>
          <button 
            className="overlay-close-btn"
            onClick={() => {
              setShowOverlay(false);
              setOverlayType(null);
              overlayActiveRef.current = false;
            }}
          >
            ×
          </button>
        </div>
      </div>
      
      <div className="overlay-content">
        <div className="bowler-main">
          <div className="bowler-name">
            {bowlerData?.bowlername || 'Unknown Bowler'}
          </div>
          <div className="bowler-style">
            {bowlingStyle && bowlingStyle.trim() && bowlingStyle !== 'null' 
              ? bowlingStyle 
              : 'Fast Medium'
            }
          </div>
        </div>
        
        <div className="bowler-stats-grid">
          <div className="stat-item">
            <span className="stat-label">Overs</span>
            <span className="stat-value">{bowlerData?.O || '0'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Runs</span>
            <span className="stat-value">{bowlerData?.R || '0'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Wickets</span>
            <span className="stat-value">{bowlerData?.W || '0'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Dots</span>
            <span className="stat-value">{bowlerData?.D || '0'}</span>
          </div>
        </div>

        <div className="vs-batsman">
          <span className="vs-label">vs</span>
          <span className="batsman-name">{onStrike?.batsname || 'Unknown'}</span>
        </div>
      </div>
    </div>
  );

  // Reset video states when modal opens
  useEffect(() => {
    if (modalUrl) {
      setVideoLoading(true);
      setVideoReady(false);
      setIsPlaying(false);
      setPlayed(0);
      setDuration(0);
      setShowOverlay(false);
      setOverlayType(null);
      setShowBatsmanStats(false);
      
      // Reset overlay ref
      overlayActiveRef.current = false;
    }
  }, [modalUrl]);

  // Handle overlay timing logic separately from handleProgress
  useEffect(() => {
    if (!duration || !videoReady) return;
    
    const currentTime = played * duration;
    
    // Complex overlay sequence logic
    let newOverlayType = null;
    let shouldShowOverlay = false;
    let newShowBatsmanStats = showBatsmanStats;
    
    if (currentTime >= 0 && currentTime <= 5) {
      // Batsman and bowler cards from 0-5 seconds (side by side)
      shouldShowOverlay = true;
      newOverlayType = 'batsman-bowler';
      // Show stats from 2 seconds onwards
      newShowBatsmanStats = currentTime >= 2;
    } else if (currentTime >= 6 && currentTime <= 9) {
      // Shot card from 6-9 seconds (bowler overlay is removed)
      shouldShowOverlay = true;
      newOverlayType = 'shot';
    }
    
    // Update batsman stats loading state
    if (newShowBatsmanStats !== showBatsmanStats) {
      setShowBatsmanStats(newShowBatsmanStats);
    }
    
    // Create a combined state for comparison
    const currentState = overlayActiveRef.current;
    const newState = shouldShowOverlay ? newOverlayType : false;
    
    // Only update when overlay state changes
    if (currentState !== newState) {
      overlayActiveRef.current = newState;
      
      if (shouldShowOverlay) {
        setShowOverlay(true);
        setOverlayType(newOverlayType);
      } else {
        setShowOverlay(false);
        setOverlayType(null);
      }
    }
  }, [played, showBatsmanStats]);



  if (status === 'loading') {
    return (
      <div className="scoring-container">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="dashboard-title"
        >
          Scoring Dashboard
        </motion.h2>
        <div className="loading-container">
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p>Loading scoring data…</p>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="scoring-container">
        <h2 className="dashboard-title">Live Scoring</h2>
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
    <div className="scoring-container">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="dashboard-title"
      >
        Live Scoring
      </motion.h2>
      <div className="scoring-cards">
        <AnimatePresence>
          {items.map((entry, index) => {
            const sd = entry.scoring_data?.[0] || {};
            const batting = sd.BattingParameters || {};
            const onStrike = batting.OnStrike || {};
            const nonStriker = batting.NonStriker || {};
            const bowler = sd.BowlingParameters?.Bowler || {};
            const bp = sd.BattingParameters || {};
            const isVisible = visibleCards.includes(index);
            
            if (!isVisible) return null;

            return (
              <motion.div 
                key={entry.index}
                className="scoring-card"
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ 
                  duration: 0.6,
                  type: "spring",
                  stiffness: 80
                }}
                whileHover={{ 
                  y: -4,
                  transition: { duration: 0.2 }
                }}
              >
                <motion.div
                  className="video-wrapper"
                  onClick={() => {
                    setModalUrl(entry.video);
                    setCurrentVideoItem(entry);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Left overlay - Over info and event */}
                  <motion.div 
                    className="video-overlay-left"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.div className="over-info">
                      Over {entry.displayover.toFixed(1)}
                    </motion.div>
                    <motion.span 
                      className="event-badge-overlay"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {entry.event}
                    </motion.span>
                  </motion.div>

                  {/* Right overlay - View scoring button */}
                  <motion.div 
                    className="video-overlay-right"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Link 
                      className="view-scoring-overlay" 
                      to={`/scoring/${entry.index}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      View →
                    </Link>
                  </motion.div>

                  <motion.span 
                    className="play-overlay"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <span style={{ paddingLeft: '.5rem',
                      paddingBottom: '.2rem'
                     }}>▶</span>
                  </motion.span>
                  <AnimatePresence>
                    {!loadedVideos.has(entry.index) && (
                      <motion.div 
                        className="video-skeleton"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </AnimatePresence>
                  <motion.video
                    src={entry.video}
                    preload="metadata"
                    muted
                    playsInline
                    onLoadedData={() =>
                      setLoadedVideos((prev) => new Set(prev).add(entry.index))
                    }
                    initial={{ opacity: 0 }}
                    animate={{ opacity: loadedVideos.has(entry.index) ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                  />
                </motion.div>
                
                <motion.div 
                  className="score-info"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  
                  <motion.div 
                    className="player-stats"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    {[
                      { label: 'Batter', value: toPascalCase(onStrike.batsname), icon: '🏏' },
                      { label: 'Non-Striker', value: toPascalCase(nonStriker.nonstrikername), icon: '🏃' },
                      { label: 'Bowler', value: toPascalCase(bowler.bowlername), icon: '🥎' },
                      { label: 'Bowling Style', value: sd.BowlingParameters?.BowlingStyle, icon: '⚡' }
                    ].map((stat, statIndex) => (
                      <motion.div
                        key={stat.label}
                        className="stat-row"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + statIndex * 0.1 }}
                      >
                        <span className="stat-icon">{stat.icon}</span>
                        <span className="stat-label">{stat.label}:</span>
                        <span className="stat-value">{stat.value || 'N/A'}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {modalUrl && (
          <motion.div 
            className="modal-overlay" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalUrl(null)}
          >
            <motion.div 
              className="modal-content" 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button 
                className="modal-close" 
                onClick={() => setModalUrl(null)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </motion.button>
              <div className="video-player-wrapper">
                {/* Video Loading State */}
                <AnimatePresence>
                  {videoLoading && (
                    <motion.div 
                      className="video-loading-overlay"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="loading-content">
                        <motion.div
                          className="loading-spinner-video"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          Loading video...
                        </motion.p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <ReactPlayer 
                  ref={playerRef}
                  url={modalUrl} 
                  controls={false}
                  width="100%" 
                  height="80vh"
                  playing={isPlaying}
                  volume={isMuted ? 0 : volume}
                  onProgress={handleProgress}
                  onDuration={handleDuration}
                  onReady={() => {
                    setVideoLoading(false);
                    setVideoReady(true);
                  }}
                  style={{
                    background: '#000',
                    borderRadius: '16px',
                    opacity: videoReady ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                  }}
                />
                
                                 {/* Scoring Stats Overlays */}
                 {/* Batsman Overlay (0-5 seconds) */}
                 {showOverlay && overlayType === 'batsman-bowler' && currentVideoItem && (
                   <BatsmanOverlay 
                     batsmanData={currentVideoItem.scoring_data?.[0]?.BattingParameters?.OnStrike}
                     event={currentVideoItem.event}
                     showStats={showBatsmanStats}
                   />
                 )}

                 {/* Bowler Overlay (0-5 seconds) - Side by side with batsman */}
                 {showOverlay && overlayType === 'batsman-bowler' && currentVideoItem && (
                   <BowlerOverlayCompact 
                     bowlerData={currentVideoItem.scoring_data?.[0]?.BowlingParameters?.Bowler}
                     bowlingStyle={currentVideoItem.scoring_data?.[0]?.BowlingParameters?.BowlingStyle}
                     event={currentVideoItem.event}
                     showStats={showBatsmanStats}
                   />
                 )}

                 {/* Pitch Overlay (3-6 seconds) - Overlaps with batsman/bowler */}
                 {duration && videoReady && currentVideoItem && 
                  (() => {
                    const currentTime = played * duration;
                    return currentTime >= 3 && currentTime <= 6;
                  })() && (
                   <PitchOverlay 
                     battingData={currentVideoItem.scoring_data?.[0]?.BattingParameters}
                     event={currentVideoItem.event}
                   />
                 )}

                 {/* Shot Type Overlay (6-9 seconds) */}
                 {showOverlay && overlayType === 'shot' && currentVideoItem && (
                   <ShotTypeOverlay 
                     shotData={currentVideoItem.scoring_data?.[0]?.BattingParameters?.ShotPlayed}
                     event={currentVideoItem.event}
                   />
                 )}
               
                
                {/* Custom Controls Overlay */}
                <AnimatePresence>
                  {videoReady && (
                    <motion.div 
                      className="custom-video-controls"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: showControls ? 1 : 0, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                  {/* Play/Pause Button */}
                  <motion.button
                    className="play-pause-btn"
                    onClick={handlePlayPause}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isPlaying ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                  </motion.button>

                  {/* Progress Bar */}
                  <div className="progress-section">
                    <span className="time-display">{formatTime(played * duration)}</span>
                    <div className="progress-bar" onClick={handleSeek}>
                      <div className="progress-track">
                        <motion.div 
                          className="progress-fill"
                          style={{ width: `${played * 100}%` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${played * 100}%` }}
                          transition={{ duration: seeking ? 0 : 0.1 }}
                        />
                        <motion.div 
                          className="progress-thumb"
                          style={{ left: `${played * 100}%` }}
                          whileHover={{ scale: 1.2 }}
                          transition={{ duration: seeking ? 0 : 0.2 }}
                        />
                      </div>
                    </div>
                    <span className="time-display">{formatTime(duration)}</span>
                  </div>

                  {/* Volume Controls */}
                  <div className="volume-section">
                    <motion.button
                      className="volume-btn"
                      onClick={toggleMute}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isMuted || volume === 0 ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                        </svg>
                      )}
                    </motion.button>
                    <div className="volume-slider" onClick={handleVolumeChange}>
                      <div className="volume-track">
                        <motion.div 
                          className="volume-fill"
                          style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScoringDashboard;