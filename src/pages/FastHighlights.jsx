import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchHighlights,
  selectHighlightsItems,
  selectHighlightsStatus,
  selectHighlightsError,
} from '../features/highlights/highlightsSlice.js';
import {
  fetchScoring,
  selectScoringItems,
  selectScoringStatus,
} from '../features/scoring/scoringSlice.js';
import ReactPlayer from 'react-player';
import WaveSurfer from 'wavesurfer.js';
import './FastHighlights.css';
import Lottie from 'lottie-react';
import wandAnimation from '../assets/wand.json';
import magicLogoSvg from '../assets/magiclogo.svg';

const FastHighlights = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectHighlightsItems);
  const status = useSelector(selectHighlightsStatus);
  const error = useSelector(selectHighlightsError);
  const POLL_INTERVAL_MS = 5000;
  
  // Scoring data for AI Magic
  const scoringItems = useSelector(selectScoringItems);
  const scoringStatus = useSelector(selectScoringStatus);
  


  const [visibleCards, setVisibleCards] = useState([]);
  const [modalUrl, setModalUrl] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [videoSwitchLoading, setVideoSwitchLoading] = useState(false);

  // Debug video switch loading state
  useEffect(() => {
    console.log('🎯 videoSwitchLoading state changed:', videoSwitchLoading);
  }, [videoSwitchLoading]);
  
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
  const [pulledCard, setPulledCard] = useState(null);
  
  // Enhanced video player states
  const [showOverlay, setShowOverlay] = useState(false);
  const [currentVideoType, setCurrentVideoType] = useState('normal'); // 'normal' or 'ai'
  const [isVerticalVideo, setIsVerticalVideo] = useState(false);
  
  // AI Magic states
  const [magicWandAnimation, setMagicWandAnimation] = useState({}); // {cardId: isAnimating}
  const [thumbnailGeneration, setThumbnailGeneration] = useState({}); // {cardId: {loading, imageUrl}}
  const [generatedThumbnails, setGeneratedThumbnails] = useState({}); // {cardId: imageUrl}


  
  const playerRef = useRef(null);
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const audioElementRef = useRef(null);
  const switchStartTimeRef = useRef(null);

  // Use API data directly
  const currentItems = status === 'succeeded' && items.length > 0 ? items : [];

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchHighlights());
    }
  }, [status, dispatch]);

  // Fetch scoring data if needed for AI Magic
  useEffect(() => {
    if (scoringStatus === 'idle') {
      console.log('🚀 Fetching scoring data...');
      dispatch(fetchScoring());
    }
  }, [scoringStatus, dispatch]);

  useEffect(() => {
    console.log('📊 FastHighlights data status:');
    console.log('   🎬 Highlights count:', items.length);
    console.log('   🏏 Scoring count:', scoringItems.length);
    console.log('   📈 Scoring status:', scoringStatus);
    if (scoringItems.length > 0) {
      console.log('   📋 Scoring data sample:', scoringItems.slice(0, 3).map(item => ({
        index: item.index,
        event: item.event,
        has_scoring_data: !!item.scoring_data
      })));
    }
  }, [items, scoringItems, scoringStatus]);
  // Polling
  useEffect(() => {
    if (status !== 'failed') {
      const id = setInterval(() => {
        dispatch(fetchHighlights());
      }, POLL_INTERVAL_MS);
      return () => clearInterval(id);
    }
  }, [status, dispatch]);

  // Staggered card reveal
  useEffect(() => {
    if (currentItems.length > 0) {
      setVisibleCards([]);
      currentItems.forEach((_, index) => {
        setTimeout(() => {
          setVisibleCards(prev => [...prev, index]);
        }, index * 100);
      });
    }
  }, [currentItems.length]);



  // Video control handlers
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
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

  // Video controls visibility handlers
  const handleVideoMouseEnter = () => {
    setShowControls(true);
  };

  const handleVideoMouseLeave = () => {
    setShowControls(false);
  };

  // Reset video states when modal opens/closes
  useEffect(() => {
    if (modalUrl) {
      setVideoLoading(true);
      setVideoReady(false);
      setIsPlaying(false);
      setPlayed(0);
      setDuration(0);
      setShowControls(true); // Show controls when video loads
      setVideoSwitchLoading(false); // Reset switch loading when opening modal
      switchStartTimeRef.current = null; // Reset timer
    } else {
      // Reset switch loading when modal closes
      setVideoSwitchLoading(false);
      switchStartTimeRef.current = null; // Reset timer
    }
  }, [modalUrl]);

  const openVideoModal = (normalUrl, aiUrl, isVertical = false) => {
    setModalUrl({ normal: normalUrl, ai: aiUrl });
    setCurrentVideoType('normal');
    setShowOverlay(false); // Reset overlay state
    setIsVerticalVideo(isVertical);
  };

  const openAudioModal = (audioUrl) => {
    setAudioUrl(audioUrl);
  };

  // 3D Card functions
  const handleCardPull = (cardId) => {
    setPulledCard(pulledCard === cardId ? null : cardId);
  };



  const handleCardSelect = (cardId) => {
    setSelectedCard(selectedCard === cardId ? null : cardId);
  };

  // AI Magic API call function
  const generateThumbnail = async (highlight, aspectRatio) => {
    const cardId = `${aspectRatio === '16:9' ? 'horizontal' : 'vertical'}-${highlight.index}`;
    
    try {
      // Find corresponding scoring data for this highlight
      // Handle potential index mismatch (highlights may be 0-indexed, scoring 1-indexed)
      const scoringData = scoringItems.find(item => item.index === highlight.index) || 
                         scoringItems.find(item => item.index === highlight.index + 1);
      
      console.log('🔍 Searching for scoring data for highlight index:', highlight.index);
      console.log('📊 Available scoring items:', scoringItems.map(item => ({ index: item.index, event: item.event })));
      console.log('🎯 Found scoring data:', scoringData ? 'YES' : 'NO');
      if (scoringData) {
        console.log('📈 Scoring data details:', {
          index: scoringData.index,
          event: scoringData.event,
          scoring_data_length: scoringData.scoring_data?.length || 0
        });
      }
      
      let events = ["1", "Dot", "4", "1", "2", "Dot"]; // fallback
      let last_ball_scorecard = "MI 98-3"; // fallback
      
      if (scoringData && scoringData.scoring_data && scoringData.scoring_data.length > 0) {
        // Extract events from scoring data
        events = scoringData.scoring_data.map(ball => {
          const event = ball.Commentary?.Event || "Dot";
          const runsScored = ball.BattingParameters?.RunsScored?.hit_to_fence_value || "0";
          
          console.log('🏏 Processing ball event:', { event, runsScored });
          
          // Map events to expected format
          switch (event.toLowerCase()) {
            case 'four':
            case 'boundary':
              return "4";
            case 'six':
            case 'maximum':
              return "6";
            case 'single':
              return "1";
            case 'two runs':
            case 'double':
              return "2";
            case 'three runs':
            case 'triple':
              return "3";
            case 'dot ball':
            case 'dot':
              return "Dot";
            default:
              // For any other case, use the runs scored value
              const runs = parseInt(runsScored) || 0;
              return runs === 0 ? "Dot" : runs.toString();
          }
        });
        
        // Get the last ball's scorecard
        const lastBall = scoringData.scoring_data[scoringData.scoring_data.length - 1];
        last_ball_scorecard = lastBall?.Commentary?.DisplayScore || "MI 98-3";
        
        console.log('✅ Successfully extracted data from scoring API:');
        console.log('   📋 Events:', events);
        console.log('   🏏 Last ball scorecard:', last_ball_scorecard);
      } else {
        console.log('⚠️ Using fallback data - scoring data not found or empty');
      }
      
      const payload = {
        events: events,
        over_number: highlight.over_number,
        last_ball_scorecard: last_ball_scorecard,
        aspect_ratio: aspectRatio
      };

      console.log('🎯 Final AI Magic Payload for highlight', highlight.index, ':', payload);

      setThumbnailGeneration(prev => ({
        ...prev,
        [cardId]: { loading: true, imageUrl: null }
      }));

      const response = await fetch('/generate-thumbnail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        
        setGeneratedThumbnails(prev => ({
          ...prev,
          [cardId]: imageUrl
        }));
        
        setThumbnailGeneration(prev => ({
          ...prev,
          [cardId]: { loading: false, imageUrl }
        }));
      } else {
        throw new Error('Failed to generate thumbnail');
      }
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      setThumbnailGeneration(prev => ({
        ...prev,
        [cardId]: { loading: false, imageUrl: null }
      }));
    }
  };

  // Handle AI Magic button click
  const handleAiMagic = async (highlight, aspectRatio, e) => {
    e.stopPropagation();
    
    const cardId = `${aspectRatio === '16:9' ? 'horizontal' : 'vertical'}-${highlight.index}`;
    
    // Start magic wand animation
    setMagicWandAnimation(prev => ({
      ...prev,
      [cardId]: true
    }));

    // Start API call
    generateThumbnail(highlight, aspectRatio);

    // Stop magic wand animation after 3-5 seconds
    setTimeout(() => {
      setMagicWandAnimation(prev => ({
        ...prev,
        [cardId]: false
      }));
    }, 4000); // 4 seconds
  };

  // Enhanced video player functions
  const toggleVideoType = () => {
    console.log('🔄 Video switch started - Setting loading state');
    switchStartTimeRef.current = Date.now();
    setVideoSwitchLoading(true);
    setVideoReady(false);
    setIsPlaying(false); // Pause current video during switch
    
    // Small delay to ensure loading state renders before video type change
    setTimeout(() => {
      console.log('🎬 Changing video type');
      setCurrentVideoType(prev => {
        const newType = prev === 'normal' ? 'ai' : 'normal';
        console.log(`📺 Switching from ${prev} to ${newType}`);
        // Hide overlay when switching to normal video
        if (newType === 'normal') {
          setShowOverlay(false);
        }
        return newType;
      });
    }, 100); // Small delay to ensure loading state shows
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
      <motion.div
        className="highlights-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="highlights-title">
          Fast Highlight Packages
        </h2>
      </motion.div>
      
      <div className="highlights-3d-container">
        {/* Horizontal Video Stack (Left) */}
        <div className="video-stack horizontal-stack">
          <h3 className="stack-title">
            <span className="stack-icon">📺</span>
            Horizontal Videos (16:9)
          </h3>
          <div className="card-stack">
            <AnimatePresence>
              {currentItems.map((highlight, index) => {
                const isVisible = visibleCards.includes(index);
                const cardId = `horizontal-${highlight.index}`;
                const isPulled = pulledCard === cardId;
                
                if (!isVisible) return null;
                
                return (
                  <motion.div
                    key={cardId}
                    className={`highlight-card-3d horizontal-card ${isPulled ? 'pulled' : ''}`}
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
                          <motion.button
                            className="ai-magic-btn"
                            onClick={(e) => handleAiMagic(highlight, '16:9', e)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={thumbnailGeneration[cardId]?.loading}
                          >
                            <img src={magicLogoSvg} alt="Magic Logo" className="magic-logo-icon" />
                            AI Magic
                          </motion.button>
                        </motion.div>

                        <div className={`video-preview-3d ${magicWandAnimation[cardId] ? 'magic-active' : ''}`}>
                          <video 
                            className="preview-video"
                            src={highlight.video_h_path}
                            preload="metadata"
                            muted
                            playsInline
                            poster=""
                          />
                          
                          {/* Magic Wand Animation */}
                          <AnimatePresence>
                            {magicWandAnimation[cardId] && (
                              <motion.div
                                className="magic-wand-overlay"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ 
                                  opacity: 1, 
                                  scale: 1,
                                  x: [0, 30, -20, 15, -8, 0],
                                  y: [0, -15, 20, -10, 5, 0]
                                }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ 
                                  duration: 4,
                                  x: { duration: 4, ease: "easeInOut" },
                                  y: { duration: 4, ease: "easeInOut" }
                                }}
                              >
                                <Lottie
                                  animationData={wandAnimation}
                                  loop={true}
                                  autoplay={true}
                                  style={{ width: '80px', height: '80px' }}
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Generated Thumbnail Overlay */}
                          <AnimatePresence>
                            {generatedThumbnails[cardId] && (
                              <motion.div
                                className="generated-thumbnail-overlay"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                              >
                                <img 
                                  src={generatedThumbnails[cardId]} 
                                  alt="Generated Thumbnail" 
                                  className="generated-thumbnail"
                                />
                                <div className="thumbnail-badge">
                                  AI Generated
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="card-controls-3d">
                          <motion.button
                            className="video-btn-3d normal"
                            onClick={(e) => {
                              e.stopPropagation();
                              openVideoModal(highlight.video_h_path, highlight.video_h_ai_path, false);
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            ▶ Play Video
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
              {currentItems.map((highlight, index) => {
                const isVisible = visibleCards.includes(index);
                const cardId = `vertical-${highlight.index}`;
                const isPulled = pulledCard === cardId;
                
                if (!isVisible) return null;
                
                return (
                  <motion.div
                    key={cardId}
                    className={`highlight-card-3d vertical-card ${isPulled ? 'pulled' : ''}`}
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
                          <motion.button
                            className="ai-magic-btn"
                            onClick={(e) => handleAiMagic(highlight, '9:16', e)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={thumbnailGeneration[cardId]?.loading}
                          >
                            <img src={magicLogoSvg} alt="Magic Logo" className="magic-logo-icon" />
                            AI Magic
                          </motion.button>
                        </motion.div>

                        <div className={`video-preview-3d ${magicWandAnimation[cardId] ? 'magic-active' : ''}`}>
                          <video 
                            className="preview-video"
                            src={highlight.video_v_path}
                            preload="metadata"
                            muted
                            playsInline
                            poster=""
                          />
                          
                          {/* Magic Wand Animation */}
                          <AnimatePresence>
                            {magicWandAnimation[cardId] && (
                              <motion.div
                                className="magic-wand-overlay"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ 
                                  opacity: 1, 
                                  scale: 1,
                                  x: [0, 30, -20, 15, -8, 0],
                                  y: [0, -15, 25, -10, 8, 0]
                                }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ 
                                  duration: 4,
                                  x: { duration: 4, ease: "easeInOut" },
                                  y: { duration: 4, ease: "easeInOut" }
                                }}
                              >
                                <Lottie
                                  animationData={wandAnimation}
                                  loop={true}
                                  autoplay={true}
                                  style={{ width: '80px', height: '80px' }}
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Generated Thumbnail Overlay */}
                          <AnimatePresence>
                            {generatedThumbnails[cardId] && (
                              <motion.div
                                className="generated-thumbnail-overlay"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                              >
                                <img 
                                  src={generatedThumbnails[cardId]} 
                                  alt="Generated Thumbnail" 
                                  className="generated-thumbnail"
                                />
                                <div className="thumbnail-badge">
                                  AI Generated
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="card-controls-3d">
                          <motion.button
                            className="video-btn-3d normal"
                            onClick={(e) => {
                              e.stopPropagation();
                              openVideoModal(highlight.video_v_path, highlight.video_v_ai_path, true);
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            ▶ Play Video
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
              {currentItems.map((highlight, index) => {
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

              {/* Enhanced Controls Header */}
              <div className={`enhanced-controls-header ${isVerticalVideo ? 'vertical-video' : ''}`}>
                {modalUrl?.normal && modalUrl?.ai && (
                  <>
                    <motion.button
                      className="version-toggle"
                      onClick={toggleVideoType}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {currentVideoType === 'normal' ? '🤖 AI Enhanced' : '📺 Normal Video'}
                    </motion.button>
                    {currentVideoType === 'ai' && !videoSwitchLoading && (
                      <motion.button
                        className="overlay-toggle"
                        onClick={() => setShowOverlay(!showOverlay)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {showOverlay ? '👁️ Hide Details' : '👁️ Show Details'}
                      </motion.button>
                    )}
                  </>
                )}
              </div>
              
              <div 
                className="video-player-wrapper enhanced-wrapper"
                onMouseEnter={handleVideoMouseEnter}
                onMouseLeave={handleVideoMouseLeave}
              >
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

                {/* Video Switch Loading State */}
                <AnimatePresence>
                  {videoSwitchLoading && (
                    <motion.div 
                      className="video-switch-loading-overlay"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="switch-loading-content">
                        <motion.div
                          className="switch-loading-icon"
                          animate={{ 
                            rotate: 360,
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ 
                            rotate: { duration: 1, repeat: Infinity, ease: "linear" },
                            scale: { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
                          }}
                        >
                          {currentVideoType === 'ai' ? '🤖' : '📺'}
                        </motion.div>
                        <motion.h3
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          Switching to {currentVideoType === 'ai' ? 'AI Enhanced' : 'Normal'} Video
                        </motion.h3>
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          {currentVideoType === 'ai' 
                            ? 'Loading enhanced version with improved quality and effects...' 
                            : 'Loading original video without enhancements...'}
                        </motion.p>
                        <motion.div
                          className="switch-progress-bar"
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Single Video Mode */}
                <motion.div 
                  className="single-video-container"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >

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
                      console.log('✅ Video ready - Clearing loading states');
                      setVideoLoading(false);
                      setVideoReady(true);
                      
                      // Ensure minimum loading display time for better UX
                      if (switchStartTimeRef.current) {
                        const elapsedTime = Date.now() - switchStartTimeRef.current;
                        const minDisplayTime = 1200; // 1.2 seconds minimum
                        
                        if (elapsedTime < minDisplayTime) {
                          const remainingTime = minDisplayTime - elapsedTime;
                          console.log(`⏱️ Keeping loading for ${remainingTime}ms more`);
                          setTimeout(() => {
                            console.log('🎉 Minimum display time reached - Hiding loading');
                            setVideoSwitchLoading(false);
                            switchStartTimeRef.current = null;
                          }, remainingTime);
                        } else {
                          console.log('🎉 Enough time elapsed - Hiding loading immediately');
                          setVideoSwitchLoading(false);
                          switchStartTimeRef.current = null;
                        }
                      } else {
                        setVideoSwitchLoading(false);
                      }
                    }}
                    style={{
                      background: '#000',
                      borderRadius: '16px',
                      opacity: videoReady ? 1 : 0,
                      transition: 'opacity 0.3s ease'
                    }}
                  />
                  
                  {/* AI Enhancement Overlay */}
                  <AnimatePresence>
                    {showOverlay && currentVideoType === 'ai' && (
                      <motion.div 
                        className={`comparison-overlay ${isVerticalVideo ? 'vertical-video-overlay' : ''}`}
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
                            <li>🎬 Stabilization improvements</li>
                            <li>✨ Noise reduction</li>
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                
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
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                      </svg>
                    ) : (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" style={{marginLeft: '2px'}}>
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
