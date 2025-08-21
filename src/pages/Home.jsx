import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ColorPanels } from '@paper-design/shaders-react';
import './Home.css';

// Mock Data
const mockCommentary = {
  over: 12.3,
  event: "FOUR",
  languages: {
    english: "Magnificent shot! The batsman drives it through the covers for a beautiful four.",
    hindi: "शानदार शॉट! बल्लेबाज ने इसे कवर्स के माध्यम से एक सुंदर चौका मारा।",
    marathi: "उत्कृष्ट फटका! फलंदाजाने हा कव्हर्सतून एक सुंदर चौकार मारला.",
    hinglish: "Kya shot hai yaar! Batsman ne cover drive mein perfect four mara hai!"
  }
};

const mockScoring = {
  batsman: {
    name: "Virat Kohli",
    runs: 67,
    balls: 45,
    fours: 8,
    sixes: 2,
    strikeRate: 148.89
  },
  bowler: {
    name: "Pat Cummins",
    overs: 7.2,
    maidens: 1,
    runs: 34,
    wickets: 2,
    economy: 4.64
  },
  events: [
    { type: "FOUR", description: "Boundary through covers" },
    { type: "SIX", description: "Maximum over deep mid-wicket" },
    { type: "WICKET", description: "Caught behind off the edge" },
    { type: "DOT", description: "Solid defensive shot" }
  ]
};

const mockHighlights = {
  title: "Match Highlights - Super Over",
  duration: "2:34",
  views: "1.2M",
  description: "Experience the thrilling super over with AI-enhanced commentary"
};

const Home = () => {
  const navigate = useNavigate();
  
  // State for cycling demos
  const [currentLanguage, setCurrentLanguage] = useState(0);
  const [currentEvent, setCurrentEvent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  
  const languages = ['english', 'hindi', 'marathi', 'hinglish'];
  const languageLabels = { english: 'EN', hindi: 'HI', marathi: 'MR', hinglish: 'HN' };

  // Auto-cycle through languages for AI commentary demo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLanguage((prev) => (prev + 1) % languages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Auto-cycle through events for scoring demo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEvent((prev) => (prev + 1) % mockScoring.events.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="home-container">
             {/* Paper Shaders Background - Optimized for Performance */}
       <div className="shader-background">
         {/* Primary ColorPanels Layer - Core Cricmate brand flow */}
         <ColorPanels
           speed={0.2}
           colors={[
             '#0d0113', // Cricmate dark
             '#e83f7e', // Cricmate primary pink
             '#8193c0', // Cricmate accent blue
             '#1a1a1a', // Cricmate surface
             '#e83f7e', // Return to primary
             '#0d0113'  // Return to dark
           ]}
           className="primary-panels"
         />
         
         {/* Secondary Layer - Subtle depth with reduced complexity */}
         <ColorPanels
           speed={0.1}
           colors={[
             '#2d1b3d', // Deep purple blend
             '#e83f7e', // Cricmate primary
             '#8193c0', // Cricmate accent
             '#1a1a1a', // Surface
             '#2d1b3d'  // Return to deep purple
           ]}
           className="secondary-panels"
         />
       </div>

      {/* Content Layer */}
      <div className="content-layer">
        <motion.div 
          className="hero-section"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
          >
            <span className="brand-accent">Cricmate</span>
          </motion.h1>
          
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
          >
            Your ultimate <span className="feature-accent">cricket companion</span> with AI-powered 
            commentary, <span className="highlight-accent">fast highlights</span>, and real-time scoring
          </motion.p>


        </motion.div>

        {/* Compact Feature Cards Row */}
        <motion.div 
          className="feature-cards-row"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
        >
          
          {/* AI Commentary Card */}
          <motion.div
            className="feature-card ai-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            onClick={() => handleNavigate('/aicommentary')}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="card-glow ai-glow"></div>
            <div className="card-content">
              <div className="card-header">
                <motion.div 
                  className="card-icon ai-icon"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  🤖
                </motion.div>
                <div className="card-title">
                  <h3>AI Commentary</h3>
                  <p>Multi-language insights</p>
                </div>
                <motion.div 
                  className="card-arrow"
                  whileHover={{ x: 5 }}
                >
                  →
                </motion.div>
              </div>
              
              <div className="card-demo">
                <div className="compact-info">
                  <span className="over-badge">Over {mockCommentary.over}</span>
                  <motion.span 
                    className={`event-pill ${mockCommentary.event.toLowerCase()}`}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2 }}
                  >
                    {mockCommentary.event}
                  </motion.span>
                </div>
                
                <div className="lang-dots">
                  {languages.map((lang, index) => (
                    <motion.div
                      key={lang}
                      className={`lang-dot ${index === currentLanguage ? 'active' : ''}`}
                      animate={{ 
                        scale: index === currentLanguage ? 1.2 : 1,
                        opacity: index === currentLanguage ? 1 : 0.4 
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {languageLabels[lang]}
                    </motion.div>
                  ))}
                </div>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentLanguage}
                    className="mini-commentary"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    {mockCommentary.languages[languages[currentLanguage]].slice(0, 60)}...
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Live Scoring Card */}
          <motion.div
            className="feature-card scoring-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            onClick={() => handleNavigate('/scoring')}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="card-glow scoring-glow"></div>
            <div className="card-content">
              <div className="card-header">
                <motion.div 
                  className="card-icon scoring-icon"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  📊
                </motion.div>
                <div className="card-title">
                  <h3>Live Scoring</h3>
                  <p>Real-time stats</p>
                </div>
                <motion.div 
                  className="card-arrow"
                  whileHover={{ x: 5 }}
                >
                  →
                </motion.div>
              </div>
              
              <div className="card-demo">
                <div className="mini-players">
                  <div className="mini-player batsman">
                    <span className="player-emoji">🏏</span>
                    <div className="player-info">
                      <span className="player-name">{mockScoring.batsman.name}</span>
                      <span className="player-stat">{mockScoring.batsman.runs}*({mockScoring.batsman.balls})</span>
                    </div>
                  </div>
                  
                  <div className="vs-divider">VS</div>
                  
                  <div className="mini-player bowler">
                    <span className="player-emoji">🥎</span>
                    <div className="player-info">
                      <span className="player-name">{mockScoring.bowler.name}</span>
                      <span className="player-stat">{mockScoring.bowler.wickets}/{mockScoring.bowler.runs}</span>
                    </div>
                  </div>
                </div>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentEvent}
                    className="mini-event"
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className={`event-pill ${mockScoring.events[currentEvent].type.toLowerCase()}`}>
                      {mockScoring.events[currentEvent].type}
                    </span>
                    <span className="event-desc">{mockScoring.events[currentEvent].description}</span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Fast Highlights Card */}
          <motion.div
            className="feature-card highlights-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            onClick={() => handleNavigate('/highlights')}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="card-glow highlights-glow"></div>
            <div className="card-content">
              <div className="card-header">
                <motion.div 
                  className="card-icon highlights-icon"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  ⚡
                </motion.div>
                <div className="card-title">
                  <h3>Fast Highlights</h3>
                  <p>AI-enhanced clips</p>
                </div>
                <motion.div 
                  className="card-arrow"
                  whileHover={{ x: 5 }}
                >
                  →
                </motion.div>
              </div>
              
              <div className="card-demo">
                <div className="mini-video">
                  <motion.div 
                    className="mini-play-btn"
                    animate={{ 
                      scale: [1, 1.15, 1],
                      opacity: [0.7, 1, 0.7] 
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ▶
                  </motion.div>
                  <div className="video-info">
                    <span className="video-title">{mockHighlights.title}</span>
                    <div className="video-meta">
                      <span>⏱️ {mockHighlights.duration}</span>
                      <span>👁️ {mockHighlights.views}</span>
                    </div>
                  </div>
                </div>
                
                <motion.div 
                  className="ai-badge"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="ai-spark">✨</span>
                  AI Enhanced
                </motion.div>
                

              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
  </div>
);
};

export default Home;