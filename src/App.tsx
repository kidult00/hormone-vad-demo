import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HormoneEmotionSimulator from './components/HormoneEmotionSimulator';
import Emotion3DPage from './pages/Emotion3DPage';

// 定义VAD状态类型
interface VADState {
  valence: number;
  arousal: number;
  dominance: number;
}

function App() {
  // 管理当前VAD状态
  const [currentVAD, setCurrentVAD] = useState<VADState>({ valence: 0, arousal: 0, dominance: 0 });
  
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 p-4">
        <Routes>
          <Route path="/" element={<HormoneEmotionSimulator setCurrentVAD={setCurrentVAD} />} />
          <Route path="/3d" element={<Emotion3DPage currentVAD={currentVAD} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App
