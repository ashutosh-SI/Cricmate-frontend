import React from 'react';
import { motion } from 'framer-motion';
import { ColorPanels } from '@paper-design/shaders-react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      {/* Paper Shaders Background */}
      <div className="shader-background">
        {/* Primary ColorPanels Layer - Cricmate brand gradients */}
        <ColorPanels
          speed={0.4}
          colors={[
            '#0d0113', // Cricmate dark background
            '#e83f7e', // Cricmate primary pink
            '#8193c0', // Cricmate accent blue
            '#1a1a1a', // Cricmate surface
            '#2d1b3d', // Deep purple blend
            '#d63384', // Cricket ball red
            '#1e3a5f', // Deep cricket blue
            '#0f4c75', // Stadium blue
            '#4a5568', // Pitch gray
            '#2a4a3d', // Cricket field green
            '#6b46c1', // Royal purple
            '#0d0113'  // Return to dark
          ]}
          className="primary-panels"
        />
        
        {/* Secondary Layer for depth and flow (same palette for unified top/bottom) */}
        <ColorPanels
          speed={0.25}
          colors={[
            '#0d0113', '#e83f7e', '#8193c0', '#1a1a1a', '#2d1b3d',
            '#d63384', '#1e3a5f', '#0f4c75', '#4a5568', '#2a4a3d', '#6b46c1', '#0d0113'
          ]}
          className="secondary-panels"
        />
        
        {/* Accent Layer for extra motion (same palette for cohesion) */}
        <ColorPanels
          speed={0.15}
          colors={[
            '#0d0113', '#e83f7e', '#8193c0', '#1a1a1a', '#2d1b3d',
            '#d63384', '#1e3a5f', '#0f4c75', '#4a5568', '#2a4a3d', '#6b46c1', '#0d0113'
          ]}
          className="accent-panels"
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
            Welcome to <span className="brand-accent">Cricmate</span>
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
              whileHover={{ 
                scale: 1.05, 
                y: -2,
                boxShadow: "0 20px 40px rgba(232, 63, 126, 0.4)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              Explore Highlights
            </motion.button>
            
            <motion.button 
              className="cta-secondary"
              whileHover={{ 
                scale: 1.05, 
                y: -2,
                backgroundColor: "rgba(255, 255, 255, 0.1)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              AI Commentary
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div 
          className="features-grid"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
        >
          {[
            {
              title: "AI Commentary",
              description: "Experience cricket like never before with intelligent AI commentary",
              icon: "🤖",
              accent: "ai-accent"
            },
            {
              title: "Fast Highlights",
              description: "Quick access to the most exciting moments of the game",
              icon: "⚡",
              accent: "highlights-accent"
            },
            {
              title: "Live Scoring",
              description: "Real-time match updates and comprehensive scoring dashboard",
              icon: "📊",
              accent: "scoring-accent"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              className={`feature-card ${feature.accent}`}
              initial={{ opacity: 0, y: 40, rotateY: -15 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: 1 + (index * 0.2), 
                ease: "easeOut" 
              }}
              whileHover={{
                y: -10,
                rotateY: 5,
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Home;