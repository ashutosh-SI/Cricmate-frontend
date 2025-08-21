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

          <motion.div 
            className="cta-buttons"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
          >
            <motion.button 
              className="cta-primary"
              onClick={() => handleNavigate('/highlights')}
              whileHover={{ 
                scale: 1.05, 
                y: -2,
                boxShadow: "0 20px 40px rgba(232, 63, 126, 0.4)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="btn-content">
                <span className="btn-icon">⚡</span>
                Explore Highlights
              </span>
            </motion.button>
            
            <motion.button 
              className="cta-secondary"
              onClick={() => handleNavigate('/aicommentary')}
              whileHover={{ 
                scale: 1.05, 
                y: -2,
                backgroundColor: "rgba(255, 255, 255, 0.1)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="btn-content">
                <span className="btn-icon">🤖</span>
                AI Commentary
              </span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Interactive Feature Demos */}
        <motion.div 
          className="features-showcase"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
        >
          
          {/* AI Commentary Demo */}
          <motion.div
            className="demo-section ai-commentary-demo"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            onClick={() => handleNavigate('/aicommentary')}
          >
            <div className="demo-header">
              <motion.div className="demo-icon">🤖</motion.div>
              <div className="demo-title-section">
                <h3>AI Commentary and Cricket Assistant Bot</h3>
                <p>Multi-language insights and an interactive assistant</p>
              </div>
              <motion.div 
                className="explore-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore →
              </motion.div>
            </div>
            
            <div className="demo-content">
              <div className="commentary-demo-card">
                <div className="match-info">
                  <span className="over-info">Over {mockCommentary.over}</span>
                  <motion.span 
                    className={`event-badge ${mockCommentary.event.toLowerCase()}`}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    {mockCommentary.event}
                  </motion.span>
                </div>
                
                <div className="language-selector">
                  {languages.map((lang, index) => (
                    <motion.div
                      key={lang}
                      className={`lang-indicator ${index === currentLanguage ? 'active' : ''}`}
                      animate={{ 
                        scale: index === currentLanguage ? 1.1 : 1,
                        opacity: index === currentLanguage ? 1 : 0.5 
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
                    className="commentary-text"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    {mockCommentary.languages[languages[currentLanguage]]}
                  </motion.div>
                </AnimatePresence>
                
                <motion.div 
                  className="auto-cycle-indicator"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Auto-cycling languages...
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Live Scoring Demo */}
          <motion.div
            className="demo-section live-scoring-demo"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            onClick={() => handleNavigate('/scoring')}
          >
            <div className="demo-header">
              <motion.div className="demo-icon">📊</motion.div>
              <div className="demo-title-section">
                <h3>Live Scoring</h3>
                <p>Real-time match statistics</p>
              </div>
              <motion.div 
                className="explore-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore →
              </motion.div>
            </div>
            
            <div className="demo-content">
              <div className="scoring-cards">
                <div className="player-card batsman">
                  <div className="player-info">
                    <span className="player-icon">🏏</span>
                    <div>
                      <h4>{mockScoring.batsman.name}</h4>
                      <p>On Strike</p>
                    </div>
                  </div>
                  <div className="player-stats">
                    <div className="stat-item">
                      <span className="stat-value">{mockScoring.batsman.runs}</span>
                      <span className="stat-label">Runs</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{mockScoring.batsman.balls}</span>
                      <span className="stat-label">Balls</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{mockScoring.batsman.strikeRate}</span>
                      <span className="stat-label">SR</span>
                    </div>
                  </div>
                </div>
                
                <div className="player-card bowler">
                  <div className="player-info">
                    <span className="player-icon">🥎</span>
                    <div>
                      <h4>{mockScoring.bowler.name}</h4>
                      <p>Bowling</p>
                    </div>
                  </div>
                  <div className="player-stats">
                    <div className="stat-item">
                      <span className="stat-value">{mockScoring.bowler.overs}</span>
                      <span className="stat-label">Overs</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{mockScoring.bowler.wickets}</span>
                      <span className="stat-label">Wickets</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{mockScoring.bowler.economy}</span>
                      <span className="stat-label">Econ</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentEvent}
                  className="live-event"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4 }}
                >
                  <span className={`event-type ${mockScoring.events[currentEvent].type.toLowerCase()}`}>
                    {mockScoring.events[currentEvent].type}
                  </span>
                  <span className="event-description">
                    {mockScoring.events[currentEvent].description}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Fast Highlights Demo */}
          <motion.div
            className="demo-section highlights-demo"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            onClick={() => handleNavigate('/highlights')}
          >
            <div className="demo-header">
              <motion.div className="demo-icon">⚡</motion.div>
              <div className="demo-title-section">
                <h3>Fast Highlight with AI Contextual Summary</h3>
                <p>AI-enhanced highlights with smart summaries</p>
              </div>
              <motion.div 
                className="explore-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore →
              </motion.div>
            </div>
            
            <div className="demo-content">
              <div className="highlight-player">
                <div className="video-placeholder">
                  <motion.div 
                    className="play-button"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ▶
                  </motion.div>
                  <div className="video-overlay">
                    <h4>{mockHighlights.title}</h4>
                    <div className="video-meta">
                      <span>⏱️ {mockHighlights.duration}</span>
                      <span>👁️ {mockHighlights.views}</span>
                    </div>
                  </div>
                </div>
                
                <motion.div 
                  className="ai-enhancement-tag"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🤖 AI Enhanced
                </motion.div>
                
                <div className="highlight-features">
                  <motion.div 
                    className="feature-tag"
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                  >
                    📱 Vertical & Horizontal
                  </motion.div>
                  <motion.div 
                    className="feature-tag"
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                  >
                    🎧 Audio Commentary
                  </motion.div>
                  <motion.div 
                    className="feature-tag"
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                  >
                    🎬 Smart Editing
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
  </div>
);
};

export default Home;