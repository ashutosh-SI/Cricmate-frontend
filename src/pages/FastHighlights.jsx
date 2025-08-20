import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchHighlights,
  selectHighlightsItems,
  selectHighlightsStatus,
  selectHighlightsError,
} from '../features/highlights/highlightsSlice.js';
import ReactPlayer from 'react-player';
import WaveSurfer from 'wavesurfer.js';
import './FastHighlights.css';

const FastHighlights = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectHighlightsItems);
  const status = useSelector(selectHighlightsStatus);
  const error = useSelector(selectHighlightsError);
  
  const [visibleCards, setVisibleCards] = useState([]);
  const [modalUrl, setModalUrl] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [seeking, setSeeking] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  
  // Audio player states
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioVolume, setAudioVolume] = useState(0.8);
  const [audioMuted, setAudioMuted] = useState(false);
  const [wavesurferFailed, setWavesurferFailed] = useState(false);
  const [audioSeeking, setAudioSeeking] = useState(false);
  
  // 3D Card states
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardFlipped, setCardFlipped] = useState({});
  const [pulledCard, setPulledCard] = useState(null);
  
  // Enhanced video player states
  const [comparisonMode, setComparisonMode] = useState(false);
  const [splitPosition, setSplitPosition] = useState(50);
  const [showOverlay, setShowOverlay] = useState(false);
  const [currentVideoType, setCurrentVideoType] = useState('normal'); // 'normal' or 'ai'
  
  const playerRef = useRef(null);
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const audioElementRef = useRef(null);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchHighlights());
    }
  }, [status, dispatch]);

  // Staggered card reveal
  useEffect(() => {
    if (status === 'succeeded' && items.length > 0) {
      setVisibleCards([]);
      items.forEach((_, index) => {
        setTimeout(() => {
          setVisibleCards(prev => [...prev, index]);
        }, index * 100);
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

  // Reset video states when modal opens
  useEffect(() => {
    if (modalUrl) {
      setVideoLoading(true);
      setVideoReady(false);
      setIsPlaying(false);
      setPlayed(0);
      setDuration(0);
    }
  }, [modalUrl]);

  const openVideoModal = (videoUrl) => {
    setModalUrl(videoUrl);
    setComparisonMode(false);
    setSplitPosition(50);
    setCurrentVideoType('normal');
  };

  const openComparisonModal = (normalUrl, aiUrl) => {
    setModalUrl({ normal: normalUrl, ai: aiUrl });
    setComparisonMode(true);
    setSplitPosition(50);
    setCurrentVideoType('normal');
  };

  const openAudioModal = (audioUrl) => {
    setAudioUrl(audioUrl);
  };

  // 3D Card functions
  const handleCardPull = (cardId) => {
    setPulledCard(pulledCard === cardId ? null : cardId);
  };

  const handleCardFlip = (cardId) => {
    setCardFlipped(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const handleCardSelect = (cardId) => {
    setSelectedCard(selectedCard === cardId ? null : cardId);
  };

  // Enhanced video player functions
  const toggleComparisonMode = () => {
    setComparisonMode(!comparisonMode);
  };

  const handleSplitDrag = (e) => {
    if (comparisonMode && modalUrl?.normal && modalUrl?.ai) {
      const rect = e.currentTarget.getBoundingClientRect();
      const position = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPosition(Math.max(0, Math.min(100, position)));
    }
  };

  const toggleVideoType = () => {
    setCurrentVideoType(prev => prev === 'normal' ? 'ai' : 'normal');
  };

  // Initialize WaveSurfer when audio modal opens
  useEffect(() => {
    if (audioUrl) {
      setAudioLoading(true);
      setWavesurferFailed(false);
      
      // Destroy existing instance
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
        wavesurfer.current = null;
      }

      // Try WaveSurfer first
      if (waveformRef.current && !wavesurferFailed) {
        try {
          wavesurfer.current = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: '#8193c0',
            progressColor: '#e83f7e',
            cursorColor: '#ffffff',
            barWidth: 2,
            barGap: 1,
            barRadius: 2,
            responsive: true,
            height: 80,
            normalize: true,
            backend: 'MediaElement',
            mediaControls: false,
            interact: true,
            hideScrollbar: true,
            pixelRatio: 1,
            minPxPerSec: 50,
            fillParent: true,
            scrollParent: false,
            // Additional options for better seeking
            skipLength: 2,
            cursorWidth: 2,
            progressColor: '#e83f7e',
            waveColor: '#8193c0',
            // Force interaction
            clickToSeek: true,
          });

          // Load audio
          wavesurfer.current.load(audioUrl);

          // Event listeners
          wavesurfer.current.on('ready', () => {
            console.log('WaveSurfer ready');
            setAudioLoading(false);
            const duration = wavesurfer.current.getDuration();
            setAudioDuration(duration);
            wavesurfer.current.setVolume(audioMuted ? 0 : audioVolume);
          });

          wavesurfer.current.on('play', () => {
            console.log('WaveSurfer play');
            setAudioPlaying(true);
          });

          wavesurfer.current.on('pause', () => {
            console.log('WaveSurfer pause');
            setAudioPlaying(false);
          });

          wavesurfer.current.on('audioprocess', (currentTime) => {
            setAudioCurrentTime(currentTime);
          });

          wavesurfer.current.on('seek', (progress) => {
            console.log('WaveSurfer seek event, progress:', progress);
            if (wavesurfer.current) {
              const duration = wavesurfer.current.getDuration();
              const currentTime = progress * duration;
              console.log('Setting current time to:', currentTime);
              setAudioCurrentTime(currentTime);
            }
          });

          // Additional event for better seek handling
          wavesurfer.current.on('interaction', () => {
            if (wavesurfer.current) {
              const currentTime = wavesurfer.current.getCurrentTime();
              setAudioCurrentTime(currentTime);
            }
          });

          wavesurfer.current.on('finish', () => {
            console.log('WaveSurfer finish');
            setAudioPlaying(false);
            setAudioCurrentTime(0);
          });

          wavesurfer.current.on('error', (error) => {
            console.error('WaveSurfer error:', error);
            setWavesurferFailed(true);
            setAudioLoading(false);
          });

          wavesurfer.current.on('loading', (percent) => {
            console.log('Loading:', percent + '%');
          });

        } catch (error) {
          console.error('Failed to create WaveSurfer:', error);
          setWavesurferFailed(true);
          setAudioLoading(false);
        }
      }

      // Fallback to HTML5 audio if WaveSurfer fails
      if (wavesurferFailed || !waveformRef.current) {
        console.log('Using HTML5 audio fallback');
        if (audioElementRef.current) {
          audioElementRef.current.src = audioUrl;
          audioElementRef.current.volume = audioMuted ? 0 : audioVolume;
          
          audioElementRef.current.onloadedmetadata = () => {
            setAudioDuration(audioElementRef.current.duration);
            setAudioLoading(false);
          };

          audioElementRef.current.ontimeupdate = () => {
            if (!audioSeeking) {
              setAudioCurrentTime(audioElementRef.current.currentTime);
            }
          };

          audioElementRef.current.onseeking = () => {
            setAudioSeeking(true);
          };

          audioElementRef.current.onseeked = () => {
            setAudioSeeking(false);
            setAudioCurrentTime(audioElementRef.current.currentTime);
          };

          audioElementRef.current.onplay = () => {
            setAudioPlaying(true);
          };

          audioElementRef.current.onpause = () => {
            setAudioPlaying(false);
          };

          audioElementRef.current.onended = () => {
            setAudioPlaying(false);
            setAudioCurrentTime(0);
          };

          audioElementRef.current.onerror = (error) => {
            console.error('HTML5 audio error:', error);
            setAudioLoading(false);
          };
        }
      }
    }

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
        wavesurfer.current = null;
      }
    };
  }, [audioUrl, wavesurferFailed]); // Added wavesurferFailed dependency

  // Audio control functions
  const handleAudioPlayPause = () => {
    console.log('Play/Pause clicked, wavesurfer exists:', !!wavesurfer.current, 'HTML5 exists:', !!audioElementRef.current);
    if (!audioLoading) {
      try {
        if (wavesurfer.current && !wavesurferFailed) {
          // Use WaveSurfer
          if (audioPlaying) {
            wavesurfer.current.pause();
          } else {
            wavesurfer.current.play();
          }
        } else if (audioElementRef.current) {
          // Use HTML5 audio
          if (audioPlaying) {
            audioElementRef.current.pause();
          } else {
            audioElementRef.current.play();
          }
        }
      } catch (error) {
        console.error('Error playing/pausing audio:', error);
      }
    }
  };

  const handleAudioVolumeChange = (newVolume) => {
    console.log('Volume change:', newVolume);
    setAudioVolume(newVolume);
    setAudioMuted(newVolume === 0);
    
    try {
      if (wavesurfer.current && !wavesurferFailed) {
        wavesurfer.current.setVolume(newVolume);
      } else if (audioElementRef.current) {
        audioElementRef.current.volume = newVolume;
      }
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  };

  const handleAudioMute = () => {
    console.log('Mute clicked, current muted:', audioMuted);
    const newMuted = !audioMuted;
    setAudioMuted(newMuted);
    
    try {
      if (wavesurfer.current && !wavesurferFailed) {
        wavesurfer.current.setVolume(newMuted ? 0 : audioVolume);
      } else if (audioElementRef.current) {
        audioElementRef.current.volume = newMuted ? 0 : audioVolume;
      }
    } catch (error) {
      console.error('Error muting/unmuting:', error);
    }
  };

  const handleWaveformClick = (e) => {
    console.log('Waveform clicked, duration:', audioDuration, 'wavesurferFailed:', wavesurferFailed);
    
    if (audioDuration > 0 && !audioLoading) {
      try {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const progress = Math.max(0, Math.min(1, clickX / rect.width)); // Clamp between 0 and 1
        const seekTime = progress * audioDuration;
        
        console.log('Seeking to:', seekTime, 'seconds (', Math.round(progress * 100), '%)');
        
        if (!wavesurferFailed && wavesurfer.current) {
          // WaveSurfer seek
          try {
            wavesurfer.current.seekTo(progress);
            console.log('WaveSurfer seekTo called with progress:', progress);
          } catch (seekError) {
            console.error('WaveSurfer seek error:', seekError);
          }
        } else if (audioElementRef.current) {
          // HTML5 audio seek
          try {
            setAudioSeeking(true);
            audioElementRef.current.currentTime = seekTime;
            console.log('HTML5 audio currentTime set to:', seekTime);
          } catch (seekError) {
            console.error('HTML5 audio seek error:', seekError);
            setAudioSeeking(false);
          }
        }
      } catch (error) {
        console.error('Error in handleWaveformClick:', error);
      }
    }
  };

  const formatAudioTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Update volume when audioVolume changes
  useEffect(() => {
    if (!audioLoading) {
      try {
        if (wavesurfer.current && !wavesurferFailed) {
          wavesurfer.current.setVolume(audioMuted ? 0 : audioVolume);
        } else if (audioElementRef.current) {
          audioElementRef.current.volume = audioMuted ? 0 : audioVolume;
        }
      } catch (error) {
        console.error('Error updating volume:', error);
      }
    }
  }, [audioVolume, audioMuted, audioLoading, wavesurferFailed]);

  // Reset audio states when modal closes
  useEffect(() => {
    if (!audioUrl) {
      setAudioPlaying(false);
      setAudioCurrentTime(0);
      setAudioDuration(0);
      setAudioLoading(false);
      setAudioSeeking(false);
      setWavesurferFailed(false);
    }
  }, [audioUrl]);

  if (status === 'loading') {
    return (
      <div className="highlights-container">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="highlights-title"
        >
          Fast Highlight Packages
        </motion.h2>
        <div className="loading-container">
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p>Loading highlights...</p>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="highlights-container">
        <h2 className="highlights-title">Fast Highlight Packages</h2>
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
    <div className="highlights-container">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="highlights-title"
      >
        Fast Highlight Packages
      </motion.h2>
      
      <div className="highlights-3d-container">
        {/* Horizontal Video Stack (Left) */}
        <div className="video-stack horizontal-stack">
          <h3 className="stack-title">
            <span className="stack-icon">📺</span>
            Horizontal Videos (16:9)
          </h3>
          <div className="card-stack">
            <AnimatePresence>
              {items.map((highlight, index) => {
                const isVisible = visibleCards.includes(index);
                const cardId = `horizontal-${highlight.index}`;
                const isPulled = pulledCard === cardId;
                const isFlipped = cardFlipped[cardId];
                
                if (!isVisible) return null;
                
                return (
                  <motion.div
                    key={cardId}
                    className={`highlight-card-3d horizontal-card ${isPulled ? 'pulled' : ''} ${isFlipped ? 'flipped' : ''}`}
                    initial={{ opacity: 0, x: -100, rotateY: -15 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0, 
                      rotateY: isPulled ? 0 : -15,
                      z: isPulled ? 50 : index * -10,
                      scale: isPulled ? 1.05 : 1
                    }}
                    exit={{ opacity: 0, x: -100, rotateY: -15 }}
                    transition={{ 
                      duration: 0.6,
                      type: "spring",
                      stiffness: 80,
                      delay: index * 0.1
                    }}
                    whileHover={{ 
                      rotateY: isPulled ? 0 : -5,
                      z: isPulled ? 60 : 20,
                      transition: { duration: 0.3 }
                    }}
                    onClick={() => handleCardPull(cardId)}
                    style={{
                      zIndex: isPulled ? 1000 : 100 - index,
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    <div className="card-inner">
                      {/* Front of card */}
                      <div className="card-face card-front">
                        <motion.div 
                          className="card-header-3d"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <h4 className="over-title-3d">Over {highlight.over_number}</h4>
                          <div className="card-actions">
                            <motion.button
                              className="flip-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCardFlip(cardId);
                              }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              🔄
                            </motion.button>
                          </div>
                        </motion.div>

                        <div className="video-preview-3d">
                          <div className="preview-placeholder">
                            <span className="preview-icon">📺</span>
                            <p>Horizontal Video</p>
                          </div>
                        </div>

                        <div className="card-controls-3d">
                          <motion.button
                            className="video-btn-3d normal"
                            onClick={(e) => {
                              e.stopPropagation();
                              openVideoModal(highlight.video_h_path);
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            ▶ Normal
                          </motion.button>
                          <motion.button
                            className="video-btn-3d ai"
                            onClick={(e) => {
                              e.stopPropagation();
                              openVideoModal(highlight.video_h_ai_path);
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            🤖 AI Enhanced
                          </motion.button>
                        </div>
                      </div>

                      {/* Back of card */}
                      <div className="card-face card-back">
                        <div className="card-back-content">
                          <h4>Compare Versions</h4>
                          <motion.button
                            className="comparison-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              openComparisonModal(highlight.video_h_path, highlight.video_h_ai_path);
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            🔀 Split Screen Compare
                          </motion.button>
                          <motion.button
                            className="flip-btn back-flip"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCardFlip(cardId);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            ↩ Back
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Vertical Video Stack (Right) */}
        <div className="video-stack vertical-stack">
          <h3 className="stack-title">
            <span className="stack-icon">📱</span>
            Vertical Videos (9:16)
          </h3>
          <div className="card-stack">
            <AnimatePresence>
              {items.map((highlight, index) => {
                const isVisible = visibleCards.includes(index);
                const cardId = `vertical-${highlight.index}`;
                const isPulled = pulledCard === cardId;
                const isFlipped = cardFlipped[cardId];
                
                if (!isVisible) return null;
                
                return (
                  <motion.div
                    key={cardId}
                    className={`highlight-card-3d vertical-card ${isPulled ? 'pulled' : ''} ${isFlipped ? 'flipped' : ''}`}
                    initial={{ opacity: 0, x: 100, rotateY: 15 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0, 
                      rotateY: isPulled ? 0 : 15,
                      z: isPulled ? 50 : index * -10,
                      scale: isPulled ? 1.05 : 1
                    }}
                    exit={{ opacity: 0, x: 100, rotateY: 15 }}
                    transition={{ 
                      duration: 0.6,
                      type: "spring",
                      stiffness: 80,
                      delay: index * 0.1
                    }}
                    whileHover={{ 
                      rotateY: isPulled ? 0 : 5,
                      z: isPulled ? 60 : 20,
                      transition: { duration: 0.3 }
                    }}
                    onClick={() => handleCardPull(cardId)}
                    style={{
                      zIndex: isPulled ? 1000 : 100 - index,
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    <div className="card-inner">
                      {/* Front of card */}
                      <div className="card-face card-front">
                        <motion.div 
                          className="card-header-3d"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <h4 className="over-title-3d">Over {highlight.over_number}</h4>
                          <div className="card-actions">
                            <motion.button
                              className="flip-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCardFlip(cardId);
                              }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              🔄
                            </motion.button>
                          </div>
                        </motion.div>

                        <div className="video-preview-3d">
                          <div className="preview-placeholder vertical">
                            <span className="preview-icon">📱</span>
                            <p>Vertical Video</p>
                          </div>
                        </div>

                        <div className="card-controls-3d">
                          <motion.button
                            className="video-btn-3d normal"
                            onClick={(e) => {
                              e.stopPropagation();
                              openVideoModal(highlight.video_v_path);
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            ▶ Normal
                          </motion.button>
                          <motion.button
                            className="video-btn-3d ai"
                            onClick={(e) => {
                              e.stopPropagation();
                              openVideoModal(highlight.video_v_ai_path);
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            🤖 AI Enhanced
                          </motion.button>
                        </div>
                      </div>

                      {/* Back of card */}
                      <div className="card-face card-back">
                        <div className="card-back-content">
                          <h4>Compare Versions</h4>
                          <motion.button
                            className="comparison-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              openComparisonModal(highlight.video_v_path, highlight.video_v_ai_path);
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            🔀 Split Screen Compare
                          </motion.button>
                          <motion.button
                            className="flip-btn back-flip"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCardFlip(cardId);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            ↩ Back
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Audio Section (Center Bottom) */}
        <div className="audio-section-3d">
          <h3 className="stack-title">
            <span className="stack-icon">🎵</span>
            AI Audio Commentary
          </h3>
          <div className="audio-cards">
            <AnimatePresence>
              {items.map((highlight, index) => {
                const isVisible = visibleCards.includes(index);
                
                if (!isVisible) return null;
                
                return (
                  <motion.div
                    key={`audio-${highlight.index}`}
                    className="audio-card-3d"
                    initial={{ opacity: 0, y: 50, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.8 }}
                    transition={{ 
                      duration: 0.5,
                      delay: index * 0.05
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      y: -5,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <span className="audio-over">Over {highlight.over_number}</span>
                    <motion.button
                      onClick={() => openAudioModal(highlight.ai_audio_path)}
                      className="audio-btn-3d"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="btn-icon">🎧</span>
                      Listen
                    </motion.button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Enhanced Video Modal */}
      <AnimatePresence>
        {modalUrl && (
          <motion.div 
            className="modal-overlay enhanced-modal" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalUrl(null)}
          >
            <motion.div 
              className={`modal-content ${comparisonMode ? 'comparison-mode' : ''}`}
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

              {/* Enhanced Controls Header */}
              <div className="enhanced-controls-header">
                {comparisonMode && modalUrl?.normal && modalUrl?.ai && (
                  <>
                    <motion.button
                      className="comparison-toggle active"
                      onClick={toggleComparisonMode}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🔀 Split Screen
                    </motion.button>
                    <motion.button
                      className="overlay-toggle"
                      onClick={() => setShowOverlay(!showOverlay)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {showOverlay ? '👁️ Hide Overlay' : '👁️ Show Overlay'}
                    </motion.button>
                    <motion.button
                      className="version-toggle"
                      onClick={toggleVideoType}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {currentVideoType === 'normal' ? '🤖 Switch to AI' : '📺 Switch to Normal'}
                    </motion.button>
                  </>
                )}
                {!comparisonMode && modalUrl?.normal && modalUrl?.ai && (
                  <motion.button
                    className="comparison-toggle"
                    onClick={toggleComparisonMode}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🔀 Enable Split Screen
                  </motion.button>
                )}
              </div>
              
              <div className="video-player-wrapper enhanced-wrapper">
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

                {comparisonMode && modalUrl?.normal && modalUrl?.ai ? (
                  /* Split Screen Mode */
                  <div className="split-screen-container">
                    {/* Normal Video */}
                    <motion.div 
                      className="video-half normal-video"
                      style={{ 
                        clipPath: `inset(0 ${100 - splitPosition}% 0 0)`,
                      }}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="video-label">Normal</div>
                      <ReactPlayer 
                        url={modalUrl.normal} 
                        controls={false}
                        width="100%" 
                        height="70vh"
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
                          borderRadius: '16px 0 0 16px',
                          opacity: videoReady ? 1 : 0,
                          transition: 'opacity 0.3s ease'
                        }}
                      />
                    </motion.div>

                    {/* AI Enhanced Video */}
                    <motion.div 
                      className="video-half ai-video"
                      style={{ 
                        clipPath: `inset(0 0 0 ${splitPosition}%)`,
                      }}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="video-label ai">AI Enhanced</div>
                      <ReactPlayer 
                        url={modalUrl.ai} 
                        controls={false}
                        width="100%" 
                        height="70vh"
                        playing={isPlaying}
                        volume={isMuted ? 0 : volume}
                        onProgress={handleProgress}
                        onDuration={handleDuration}
                        style={{
                          background: '#000',
                          borderRadius: '0 16px 16px 0',
                          opacity: videoReady ? 1 : 0,
                          transition: 'opacity 0.3s ease'
                        }}
                      />
                    </motion.div>

                    {/* Split Slider */}
                    <motion.div 
                      className="split-slider"
                      style={{ left: `${splitPosition}%` }}
                      onMouseDown={(e) => {
                        const handleMouseMove = (e) => handleSplitDrag(e);
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <div className="slider-handle">
                        <span>⟷</span>
                      </div>
                    </motion.div>

                    {/* Comparison Overlay */}
                    <AnimatePresence>
                      {showOverlay && (
                        <motion.div 
                          className="comparison-overlay"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <div className="overlay-content">
                            <h3>AI Enhancements</h3>
                            <ul>
                              <li>🎯 Enhanced clarity and sharpness</li>
                              <li>🌈 Improved color grading</li>
                              <li>⚡ Motion smoothing</li>
                              <li>🔍 Detail enhancement</li>
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  /* Single Video Mode */
                  <ReactPlayer 
                    ref={playerRef}
                    url={typeof modalUrl === 'string' ? modalUrl : modalUrl?.[currentVideoType] || modalUrl?.normal} 
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

      {/* Audio Modal */}
      <AnimatePresence>
        {audioUrl && (
          <motion.div 
            className="modal-overlay audio-modal" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAudioUrl(null)}
          >
            <motion.div 
              className="modal-content audio-modal-content" 
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button 
                className="modal-close" 
                onClick={() => setAudioUrl(null)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </motion.button>
              
              <div className="audio-player-container">
                <motion.h3 
                  className="audio-title"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  🎵 AI Audio Commentary
                </motion.h3>

                {/* Audio Loading State */}
                <AnimatePresence>
                  {audioLoading && (
                    <motion.div 
                      className="audio-loading-overlay"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="loading-content">
                        <motion.div
                          className="loading-spinner-audio"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          Loading audio...
                        </motion.p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hidden HTML5 Audio Element */}
                <audio 
                  ref={audioElementRef}
                  style={{ display: 'none' }}
                  preload="metadata"
                />

                {/* Waveform Container */}
                <motion.div 
                  className="waveform-container"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: audioLoading ? 0.3 : 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  onClick={handleWaveformClick}
                >
                  {wavesurferFailed ? (
                    <div className="fallback-waveform">
                      <div className="progress-bar-container">
                        <div className="progress-bar-bg">
                          <div 
                            className="progress-bar-fill"
                            style={{ 
                              width: `${audioDuration > 0 ? (audioCurrentTime / audioDuration) * 100 : 0}%` 
                            }}
                          />
                        </div>
                        <div className="waveform-bars">
                          {Array.from({ length: 50 }, (_, i) => {
                            const progress = audioDuration > 0 ? audioCurrentTime / audioDuration : 0;
                            const barProgress = i / 50;
                            const isActive = barProgress <= progress;
                            
                            return (
                              <div 
                                key={i} 
                                className="waveform-bar"
                                style={{ 
                                  height: `${Math.random() * 60 + 20}px`,
                                  opacity: isActive ? 1 : 0.3,
                                  backgroundColor: isActive ? 'var(--clr-primary)' : 'var(--clr-accent)'
                                }}
                              />
                            );
                          })}
                        </div>
                      </div>
                      <p className="fallback-text">Click to seek • HTML5 Audio Mode</p>
                    </div>
                  ) : (
                    <div ref={waveformRef} className="waveform" />
                  )}
                </motion.div>

                {/* Audio Controls */}
                <motion.div 
                  className="audio-controls"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: audioLoading ? 0.3 : 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  {/* Play/Pause Button */}
                  <motion.button
                    className="audio-play-btn"
                    onClick={handleAudioPlayPause}
                    disabled={audioLoading}
                    whileHover={{ scale: audioLoading ? 1 : 1.05 }}
                    whileTap={{ scale: audioLoading ? 1 : 0.95 }}
                  >
                    {audioPlaying ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                  </motion.button>

                  {/* Time Display */}
                  <div className="audio-time-section">
                    <span className="audio-time-display current">
                      {formatAudioTime(audioCurrentTime)}
                    </span>
                    <span className="audio-time-separator">/</span>
                    <span className="audio-time-display total">
                      {formatAudioTime(audioDuration)}
                    </span>
                  </div>

                  {/* Volume Controls */}
                  <div className="audio-volume-section">
                    <motion.button
                      className="audio-volume-btn"
                      onClick={handleAudioMute}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {audioMuted || audioVolume === 0 ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                        </svg>
                      )}
                    </motion.button>
                    
                    <div className="audio-volume-slider">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={audioMuted ? 0 : audioVolume}
                        onChange={(e) => handleAudioVolumeChange(parseFloat(e.target.value))}
                        className="volume-range"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Audio Info */}
                <motion.div 
                  className="audio-info"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <p className="audio-description">
                    🤖 AI-generated commentary with enhanced audio experience
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FastHighlights;
