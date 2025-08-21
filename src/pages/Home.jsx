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
            <span className="brand-accent">CricMate</span>
          </motion.h1>

          <motion.h5
            className="hero-h5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
          >
            From <span className="feature-accent">ball</span> to <span className="highlight-accent">broadcast</span>, instantly
          </motion.h5>
          
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

        {/* Full-width Feature Cards */}
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
                  <h3>AI Commentary and Cricket Assistant Bot</h3>
                  <p>Multi-language insights with an interactive assistant</p>
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
                  <p>Real-time match statistics</p>
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
                  <h3>Fast Highlight with AI Contextual Summary</h3>
                  <p>AI-enhanced clips and smart summaries</p>
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

          {/* AI Assistant & Analytics Card */}
          <motion.div
            className="feature-card ai-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
            onClick={() => handleNavigate('/aicommentary')}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="card-glow ai-glow"></div>
            <div className="card-content">
              <div className="card-header">
                <motion.div 
                  className="card-icon ai-icon"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  💬
                </motion.div>
                <div className="card-title">
                  <h3>AI Assistant & Stats Bot</h3>
                  <p>Player QA, NL→SQL cricket stats, session memory</p>
                </div>
                <motion.div className="card-arrow" whileHover={{ x: 5 }}>→</motion.div>
              </div>

              <div className="card-demo">
                <div className="chat-interface-mock">
                  <div className="chat-messages">
                    <div className="chat-message user-message">
                      <div className="message-bubble">How many powerplay wickets did Bumrah take last 5 matches?</div>
                    </div>
                    <div className="chat-message bot-message">
                      <div className="message-bubble">
                        <div className="typing-indicator">
                          <span></span><span></span><span></span>
                        </div>
                        <div className="bot-response">
                          📊 Bumrah took <strong>12 wickets</strong> in powerplay overs across last 5 matches
                          <br/>• Average: 2.4 wickets/match
                          <br/>• Strike rate: 18.5 balls/wicket
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="chat-input-mock">
                    <input type="text" placeholder="Ask about any player stats..." disabled />
                    <button>→</button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Smart Thumbnails & Auto Branding Card */}
          <motion.div
            className="feature-card highlights-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.8 }}
            onClick={() => handleNavigate('/highlights')}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="card-glow highlights-glow"></div>
            <div className="card-content">
              <div className="card-header">
                <motion.div 
                  className="card-icon highlights-icon"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  🖼️
                </motion.div>
                <div className="card-title">
                  <h3>Smart Thumbnails & Auto Branding</h3>
                  <p>Frame-based PNGs, Gemini enhancement, overlay rules</p>
                </div>
                <motion.div className="card-arrow" whileHover={{ x: 5 }}>→</motion.div>
              </div>

              <div className="card-demo">
                <div className="magic-thumbnail-demo">
                  <div className="thumbnail-process">
                    <div className="process-step">
                      <div className="step-icon">🎬</div>
                      <div className="step-label">Raw Video</div>
                    </div>
                    <div className="magic-arrow">✨</div>
                    <div className="process-step">
                      <div className="step-icon">🤖</div>
                      <div className="step-label">AI Analysis</div>
                    </div>
                    <div className="magic-arrow">✨</div>
                    <div className="process-step">
                      <div className="step-icon">🖼️</div>
                      <div className="step-label">Smart Thumbnail</div>
                    </div>
                  </div>
                  <div className="thumbnail-showcase">
                    <div className="thumbnail-before">
                      <div className="thumbnail-frame basic">
                        <div className="frame-content">Basic Frame</div>
                      </div>
                      <span className="thumbnail-label">Before</span>
                    </div>
                    <div className="magic-transform">
                      <div className="magic-wand">🪄</div>
                      <div className="sparkles">
                        <span className="sparkle">✨</span>
                        <span className="sparkle">⭐</span>
                        <span className="sparkle">✨</span>
                      </div>
                    </div>
                    <div className="thumbnail-after">
                      <div className="thumbnail-frame enhanced">
                        <div className="frame-content">
                          <div className="overlay-logo">CRICMATE</div>
                          <div className="overlay-text">WICKET!</div>
                          <div className="overlay-stats">Ball 3.4</div>
                        </div>
                      </div>
                      <span className="thumbnail-label">After</span>
                    </div>
                  </div>
                  <div className="magic-features">
                    <span className="magic-pill">🎯 Best frame detection</span>
                    <span className="magic-pill">🎨 Auto branding</span>
                    <span className="magic-pill">📈 CTR optimized</span>
                  </div>
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