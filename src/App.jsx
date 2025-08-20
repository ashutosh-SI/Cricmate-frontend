import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Link, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import AiCommentary from './pages/AiCommentary.jsx';
import ScoringDashboard from './pages/ScoringDashboard.jsx';
import ScoringInterface from './pages/ScoringInterface.jsx';
import FastHighlights from './pages/FastHighlights.jsx';
import ApiProfileToggle from './components/ApiProfileToggle.jsx';

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <ApiProfileToggle />
      <nav>
        <Link to="/">Home</Link> {' '}
        <Link to="/scoring">Scoring Dashboard</Link> {' '}
        <Link to="/highlights">Fast Highlights</Link>
        <Link to="/aicommentary">AI Commentary</Link> {' '}
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scoring" element={<ScoringDashboard />} />
        <Route path="/scoring/:id" element={<ScoringInterface />} />
        <Route path="/highlights" element={<FastHighlights />} />
        <Route path="/aicommentary" element={<AiCommentary />} />
      </Routes>
    </div>
  );
}

export default App
