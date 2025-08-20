import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchScoring,
  selectScoringItems,
  selectScoringStatus,
} from '../features/scoring/scoringSlice.js';
import './ScoringInterface.css';
import pitchImg from '../assets/pitch-map.png';


const ScoringInterface = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const items = useSelector(selectScoringItems);
  const status = useSelector(selectScoringStatus);
  
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchScoring());
  }, [status, dispatch]);

  useEffect(() => {
    if (status === 'succeeded') {
      const sequence = async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        setAnimationStep(1); // Show pitch
        await new Promise(resolve => setTimeout(resolve, 800));
        setAnimationStep(2); // Show bowling (top row)
        await new Promise(resolve => setTimeout(resolve, 600));
        setAnimationStep(3); // Highlight pitch zone
        await new Promise(resolve => setTimeout(resolve, 800));
        setAnimationStep(4); // Move bowling down & show batting cards
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAnimationStep(5); // Show other widgets
      };
      sequence();
    }
  }, [status]);

  const entry = items.find((it) => String(it.index) === id);

  if (status === 'loading') return <p>Loading…</p>;
  if (!entry) return <p>No data found.</p>;

  const sd = entry.scoring_data[0];
  const bp = sd.BattingParameters;
  const on = bp.OnStrike;
  const ns = bp.NonStriker;
  const shot = bp.ShotPlayed;
  const bowl = sd.BowlingParameters;
  const blr = bowl.Bowler;

  const econ = blr.O && parseFloat(blr.O) > 0 ? (parseFloat(blr.R)/parseFloat(blr.O)).toFixed(2): '—';

  return (
    <div className="scoring-interface-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      <motion.h1 
        className="main-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Over {entry.displayover.toFixed(1)} – {sd.Commentary.DisplayScore}
      </motion.h1>

      {/* Dynamic Layout - Pitch + Bowling initially, then rearranges */}
      <motion.div 
        className="dynamic-layout"
        layout
        transition={{ duration: 0.8, type: "spring" }}
      >
        {/* Pitch - always left */}
        <AnimatePresence>
          {animationStep >= 1 && (
            <motion.div 
              className={`pitch-wrapper pitch-${(bp.Pitch || '').toLowerCase().replace(/\s+/g,'-')}`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
              layoutId="pitch"
            > 
              <img src={pitchImg} className="pitch-img" />
              <div className="highlight good" />
              <div className="highlight full" />
              <div className="highlight yorker" />
              <div className="highlight short-of-good" />
              <div className="highlight short" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bowling Widget - initially top right, then moves down */}
        <AnimatePresence>
          {animationStep >= 2 && (
            <motion.div 
              className={`bowling-container ${animationStep >= 4 ? 'moved-down' : 'top-right'}`}
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                x: 0,
              }}
              transition={{ duration: 0.6, type: "spring" }}
              layout
              layoutId="bowling"
            >
              <motion.div 
                className="widget bowling-widget enhanced"
                whileHover={{ scale: 1.02 }}
              >
                <h3>🥎 Bowling</h3>
                <div className="bowler-info">
                  <motion.div 
                    className="bowler-name highlighted"
                    animate={{ 
                      color: ['var(--clr-text)', 'var(--clr-primary)', 'var(--clr-text)']
                    }}
                    transition={{ duration: 2, repeat: 2 }}
                  >
                    {blr.bowlername}
                  </motion.div>
                  <div className="bowling-stats">
                    <span>{blr.O} overs • {blr.R} runs • {blr.W} wickets</span>
                  </div>
                  <div className="bowling-style">{bowl.BowlingStyle}</div>
                  {bowl.BowlingFrom && <div className="bowling-from">From: {bowl.BowlingFrom}</div>}
                  {bowl.DeliveryType && <div className="delivery-type">{bowl.DeliveryType}</div>}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Batting Section - appears in step 4, takes right position */}
        <AnimatePresence>
          {animationStep >= 4 && (
            <motion.div 
              className="batting-section"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              layoutId="batting"
            >
              <motion.div 
                className="batting-banner"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <h2>🏏 Batting</h2>
              </motion.div>
              
              <div className="batsmen-cards">
                <motion.div 
                  className="batsman-card striker"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  <div className="batsman-header">
                    <span className="batsman-name">{on.batsname}</span>
                    <span className="striker-badge">On Strike</span>
                  </div>
                  <div className="stats-grid">
                    {[
                      { value: on.R, label: 'Runs' },
                      { value: on.B, label: 'Balls' },
                      { value: on.F, label: '4s' },
                      { value: on.S, label: 'SR' }
                    ].map((stat, idx) => (
                      <motion.div 
                        key={idx}
                        className="stat"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8 + idx * 0.1, type: "spring" }}
                      >
                        <span className="stat-value">{stat.value}</span>
                        <span className="stat-label">{stat.label}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="batting-style">{bp.BattingStyle}</div>
                </motion.div>

                <motion.div 
                  className="batsman-card non-striker"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                >
                  <div className="batsman-header">
                    <span className="batsman-name">{ns.nonstrikername}</span>
                    <span className="non-striker-badge">Non-Striker</span>
                  </div>
                  <div className="stats-grid">
                    {[
                      { value: ns.R, label: 'Runs' },
                      { value: ns.B, label: 'Balls' },
                      { value: ns.F, label: '4s' },
                      { value: ns.S, label: 'SR' }
                    ].map((stat, idx) => (
                      <motion.div 
                        key={idx}
                        className="stat"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.0 + idx * 0.1, type: "spring" }}
                      >
                        <span className="stat-value">{stat.value}</span>
                        <span className="stat-label">{stat.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bottom Row: Details */}
      <AnimatePresence>
        {animationStep >= 5 && (
          <motion.div 
            className="details-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {[
              {
                className: "shot-widget",
                title: "Shot Details",
                content: (
                  <div className="shot-info">
                    <div className="shot-main">{shot.Stroke}</div>
                    <div className="shot-meta">
                      <span>{shot.Type} • {shot.Connect} • {shot.CreasePosition}</span>
                    </div>
                    <div className="zone-runs">
                      <span className="zone">{bp.ZonePlayedIn}</span>
                      <span className="runs">{bp.RunsScored.hit_to_fence_value} runs</span>
                    </div>
                    <div className="pitch-info">Pitch: {bp.Pitch}</div>
                  </div>
                )
              },
              {
                className: "commentary-widget",
                title: "📢 Commentary",
                content: (
                  <div className="commentary-content">
                    <div className="event-badge">{sd.Commentary.Event}</div>
                    <p className="commentary-text">{sd.Commentary.audioCommentaryText}</p>
                  </div>
                )
              },
              {
                className: "fielding-widget",
                title: "🥅 Fielding",
                content: (
                  <div className="fielding-content">
                    {sd.FieldingParameters.FieldingPositions || 'No specific fielding positions noted'}
                  </div>
                )
              }
            ].map((widget, idx) => (
              <motion.div 
                key={idx}
                className={`widget ${widget.className} enhanced`}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: idx * 0.2, duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <h3>{widget.title}</h3>
                {widget.content}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScoringInterface;