import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';

const HormoneEmotionSimulator = () => {
  // 激素参数状态
  const [hormones, setHormones] = useState({
    adrenaline: { force: 50, decay: 0.95, current: 50 },
    cortisol: { force: 30, decay: 0.98, current: 30 },
    gaba: { force: 70, decay: 0.92, current: 70 },
    dopamine: { force: 60, decay: 0.94, current: 60 },
    serotonin: { force: 65, decay: 0.96, current: 65 },
    testosterone: { force: 40, decay: 0.99, current: 40 },
    oxytocin: { force: 55, decay: 0.97, current: 55 }
  });

  // 模拟控制
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [showSettings, setShowSettings] = useState(true);
  
  // 历史数据
  const [history, setHistory] = useState([]);
  const maxHistory = 100;
  
  const intervalRef = useRef(null);

  // 计算VAD因子
  const calculateVAD = (h) => {
    // Arousal = 肾上腺素 + 皮质醇 - GABA + 多巴胺*0.3
    const arousal = Math.max(0, Math.min(100, 
      h.adrenaline.current + h.cortisol.current - h.gaba.current + h.dopamine.current * 0.3
    ));
    
    // Valence = 血清素 + 多巴胺*0.7 + 催产素*0.5 - 皮质醇*0.3
    const valence = Math.max(0, Math.min(100,
      h.serotonin.current + h.dopamine.current * 0.7 + h.oxytocin.current * 0.5 - h.cortisol.current * 0.3
    ));
    
    // Dominance = 睾酮 + 多巴胺*0.4 - 催产素*0.3 + 肾上腺素*0.2
    const dominance = Math.max(0, Math.min(100,
      h.testosterone.current + h.dopamine.current * 0.4 - h.oxytocin.current * 0.3 + h.adrenaline.current * 0.2
    ));
    
    return { arousal, valence, dominance };
  };

  // 根据VAD判断情绪状态
  const getEmotionState = (vad) => {
    const { arousal, valence, dominance } = vad;
    
    if (valence > 70 && arousal > 70 && dominance > 60) return "兴奋";
    if (valence > 70 && arousal < 40 && dominance > 50) return "满足";
    if (valence < 30 && arousal > 70 && dominance < 40) return "焦虑";
    if (valence < 30 && arousal < 40 && dominance < 40) return "抑郁";
    if (valence > 60 && arousal > 60 && dominance < 40) return "愉悦";
    if (valence < 40 && arousal > 60 && dominance > 60) return "愤怒";
    if (valence > 50 && arousal < 50 && dominance < 50) return "平静";
    return "复杂";
  };

  // 模拟步骤
  const simulateStep = () => {
    setHormones(prevHormones => {
      const newHormones = { ...prevHormones };
      
      // 更新每个激素的当前值（衰减）
      Object.keys(newHormones).forEach(key => {
        newHormones[key] = {
          ...newHormones[key],
          current: newHormones[key].current * newHormones[key].decay
        };
      });
      
      // 计算VAD和情绪状态
      const vad = calculateVAD(newHormones);
      const emotion = getEmotionState(vad);
      
      // 添加到历史记录
      setHistory(prev => {
        const newHistory = [...prev, {
          time: time,
          ...vad,
          emotion,
          adrenaline: newHormones.adrenaline.current,
          cortisol: newHormones.cortisol.current,
          gaba: newHormones.gaba.current,
          dopamine: newHormones.dopamine.current,
          serotonin: newHormones.serotonin.current,
          testosterone: newHormones.testosterone.current,
          oxytocin: newHormones.oxytocin.current
        }];
        return newHistory.slice(-maxHistory);
      });
      
      return newHormones;
    });
    
    setTime(prev => prev + 1);
  };

  // 控制模拟
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(simulateStep, 200);
    } else {
      clearInterval(intervalRef.current);
    }
    
    return () => clearInterval(intervalRef.current);
  }, [isRunning, time]);

  // 重置模拟
  const resetSimulation = () => {
    setIsRunning(false);
    setTime(0);
    setHistory([]);
    setHormones({
      adrenaline: { force: 50, decay: 0.95, current: 50 },
      cortisol: { force: 30, decay: 0.98, current: 30 },
      gaba: { force: 70, decay: 0.92, current: 70 },
      dopamine: { force: 60, decay: 0.94, current: 60 },
      serotonin: { force: 65, decay: 0.96, current: 65 },
      testosterone: { force: 40, decay: 0.99, current: 40 },
      oxytocin: { force: 55, decay: 0.97, current: 55 }
    });
  };

  // 激素注入
  const injectHormone = (hormone) => {
    setHormones(prev => ({
      ...prev,
      [hormone]: {
        ...prev[hormone],
        current: Math.min(100, prev[hormone].current + prev[hormone].force)
      }
    }));
  };

  // 更新激素参数
  const updateHormone = (hormone, param, value) => {
    setHormones(prev => ({
      ...prev,
      [hormone]: {
        ...prev[hormone],
        [param]: parseFloat(value)
      }
    }));
  };

  const currentVAD = calculateVAD(hormones);
  const currentEmotion = getEmotionState(currentVAD);
  
  const radarData = [
    { subject: 'Arousal', value: currentVAD.arousal },
    { subject: 'Valence', value: currentVAD.valence },
    { subject: 'Dominance', value: currentVAD.dominance }
  ];

  const hormoneColors = {
    adrenaline: '#ff4444',
    cortisol: '#ff8844',
    gaba: '#44ff44',
    dopamine: '#4444ff',
    serotonin: '#ff44ff',
    testosterone: '#ffff44',
    oxytocin: '#44ffff'
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">激素-情绪调节模拟器</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} />}
              {isRunning ? '暂停' : '开始'}
            </button>
            <button
              onClick={resetSimulation}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              <RotateCcw size={16} />
              重置
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              <Settings size={16} />
              设置
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 当前状态 */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">当前状态</h3>
            <div className="text-3xl font-bold text-blue-600 mb-2">{currentEmotion}</div>
            <div className="space-y-1 text-sm">
              <div>Arousal: <span className="font-semibold">{currentVAD.arousal.toFixed(1)}</span></div>
              <div>Valence: <span className="font-semibold">{currentVAD.valence.toFixed(1)}</span></div>
              <div>Dominance: <span className="font-semibold">{currentVAD.dominance.toFixed(1)}</span></div>
            </div>
          </div>
          
          {/* VAD雷达图 */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">VAD因子</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          {/* 激素注入 */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">激素注入</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(hormones).map(hormone => (
                <button
                  key={hormone}
                  onClick={() => injectHormone(hormone)}
                  className="px-2 py-1 text-xs rounded text-white"
                  style={{ backgroundColor: hormoneColors[hormone] }}
                >
                  {hormone}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 参数设置 */}
      {showSettings && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">激素参数设置</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(hormones).map(([hormone, params]) => (
              <div key={hormone} className="border rounded p-3">
                <h3 className="font-semibold mb-2" style={{ color: hormoneColors[hormone] }}>
                  {hormone}
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-600">Force: {params.force}</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={params.force}
                      onChange={(e) => updateHormone(hormone, 'force', e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Decay: {params.decay.toFixed(3)}</label>
                    <input
                      type="range"
                      min="0.8"
                      max="0.99"
                      step="0.01"
                      value={params.decay}
                      onChange={(e) => updateHormone(hormone, 'decay', e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    Current: {params.current.toFixed(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 历史图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VAD历史 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">VAD因子历史</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="arousal" stroke="#ff4444" name="Arousal" strokeWidth={2} />
              <Line type="monotone" dataKey="valence" stroke="#44ff44" name="Valence" strokeWidth={2} />
              <Line type="monotone" dataKey="dominance" stroke="#4444ff" name="Dominance" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* 激素历史 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">激素水平历史</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              {Object.keys(hormoneColors).map(hormone => (
                <Line 
                  key={hormone}
                  type="monotone" 
                  dataKey={hormone} 
                  stroke={hormoneColors[hormone]} 
                  name={hormone}
                  strokeWidth={1}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* 使用说明 */}
      <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">使用说明</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">激素功能</h3>
            <ul className="space-y-1">
              <li><span style={{color: hormoneColors.adrenaline}}>肾上腺素</span>: 提升Arousal和Dominance</li>
              <li><span style={{color: hormoneColors.cortisol}}>皮质醇</span>: 提升Arousal，降低Valence</li>
              <li><span style={{color: hormoneColors.gaba}}>GABA</span>: 降低Arousal，稳定系统</li>
              <li><span style={{color: hormoneColors.dopamine}}>多巴胺</span>: 提升所有三个因子</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">参数说明</h3>
            <ul className="space-y-1">
              <li><strong>Force</strong>: 激素注入时的剂量</li>
              <li><strong>Decay</strong>: 激素衰减速率(越小衰减越快)</li>
              <li><strong>Current</strong>: 当前激素水平</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HormoneEmotionSimulator;