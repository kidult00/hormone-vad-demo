import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';

import type { HormoneKey, Hormone, Hormones, VAD, HistoryData } from '@/types/hormone';
import { 
  MAX_HISTORY, 
  UPDATE_INTERVAL, 
  HORMONE_KEYS, 
  hormoneColors, 
  initialHormones 
} from '@/constants/hormone';
import { Languages } from 'lucide-react';
import { HORMONE_TRANSLATIONS, type Language } from '@/constants/translations';



const HormoneEmotionSimulator = () => {
  // 激素参数状态
  const [hormones, setHormones] = useState<Hormones>({
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
  const [showSettings, setShowSettings] = useState(true);
  
  // 历史数据
  const [history, setHistory] = useState<HistoryData[]>([]);
  

  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 计算VAD因子 - 使用useCallback优化
  const calculateVAD = useCallback((h: Hormones): VAD => {
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
  }, []);

  // 根据VAD判断情绪状态 - 使用useCallback优化
  const getEmotionState = useCallback((vad: VAD): string => {
    const { arousal, valence, dominance } = vad;
    
    if (valence > 70 && arousal > 70 && dominance > 60) return "兴奋";
    if (valence > 70 && arousal < 40 && dominance > 50) return "满足";
    if (valence < 30 && arousal > 70 && dominance < 40) return "焦虑";
    if (valence < 30 && arousal < 40 && dominance < 40) return "抑郁";
    if (valence > 60 && arousal > 60 && dominance < 40) return "愉悦";
    if (valence < 40 && arousal > 60 && dominance > 60) return "愤怒";
    if (valence > 50 && arousal < 50 && dominance < 50) return "平静";
    return "复杂";
  }, []);

  // 模拟步骤 - 使用useCallback优化
  // 优化simulateStep函数，减少状态更新次数
  const simulateStep = useCallback(() => {
    setHormones(prevHormones => {
      const newHormones = { ...prevHormones };
      
      // 批量更新所有激素
      Object.keys(newHormones).forEach(key => {
        const hormoneKey = key as HormoneKey;
        const hormone = newHormones[hormoneKey];
        const decayedValue = hormone.current * hormone.decay;
        newHormones[hormoneKey] = {
          ...hormone,
          current: Math.max(0, Math.min(100, decayedValue))
        };
      });
      
      // 计算新的VAD值
      const newVAD = calculateVAD(newHormones);
      
      // 一次性更新历史和激素状态
      setHistory(prevHistory => {
        const lastTime = prevHistory.length > 0 ? prevHistory[prevHistory.length - 1].time : 0;
        const newData: HistoryData = {
          time: lastTime + 1,
          ...newVAD,
          emotion: getEmotionState(newVAD),
          adrenaline: newHormones.adrenaline.current,
          cortisol: newHormones.cortisol.current,
          gaba: newHormones.gaba.current,
          dopamine: newHormones.dopamine.current,
          serotonin: newHormones.serotonin.current,
          testosterone: newHormones.testosterone.current,
          oxytocin: newHormones.oxytocin.current
        };
        
        // 使用更高效的方式限制历史长度
        const newHistory = prevHistory.length >= MAX_HISTORY 
          ? [...prevHistory.slice(1), newData]
          : [...prevHistory, newData];
          
        return newHistory;
      });
      
      return newHormones;
    });
  }, [calculateVAD, getEmotionState]);

  // 初始化历史数据
  useEffect(() => {
    const initialVAD = calculateVAD(hormones);
    const initialData: HistoryData = {
      time: 0,
      ...initialVAD,
      emotion: getEmotionState(initialVAD),
      adrenaline: hormones.adrenaline.current,
      cortisol: hormones.cortisol.current,
      gaba: hormones.gaba.current,
      dopamine: hormones.dopamine.current,
      serotonin: hormones.serotonin.current,
      testosterone: hormones.testosterone.current,
      oxytocin: hormones.oxytocin.current
    };
    
    setHistory([initialData]);
  }, []); // 只在组件挂载时执行一次

  // 控制模拟 - 修复依赖数组
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(simulateStep, UPDATE_INTERVAL); // 使用UPDATE_INTERVAL
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, simulateStep]);

  // 重置模拟 - 使用useCallback优化
  // 修复resetSimulation函数，重置后立即添加初始数据点，确保图表显示初始状态
  const resetSimulation = useCallback(() => {
    setIsRunning(false);
    setHormones(initialHormones);
    
    // 立即添加初始数据点
    const initialVAD = calculateVAD(initialHormones);
    const initialData: HistoryData = {
      time: 0,
      ...initialVAD,
      emotion: getEmotionState(initialVAD),
      adrenaline: initialHormones.adrenaline.current,
      cortisol: initialHormones.cortisol.current,
      gaba: initialHormones.gaba.current,
      dopamine: initialHormones.dopamine.current,
      serotonin: initialHormones.serotonin.current,
      testosterone: initialHormones.testosterone.current,
      oxytocin: initialHormones.oxytocin.current
    };
    
    setHistory([initialData]);
  }, [calculateVAD, getEmotionState]);

  // 激素注入 - 使用useCallback优化
  // 优化激素注入函数，无论是否运行都更新历史
  const injectHormone = useCallback((hormone: HormoneKey) => {
    setHormones(prev => {
      const newHormones = {
        ...prev,
        [hormone]: {
          ...prev[hormone],
          current: Math.min(100, prev[hormone].current + prev[hormone].force)
        }
      };
      
      // 无论是否运行，都立即计算新的VAD值并更新历史
      const nextVAD = calculateVAD(newHormones);
      setHistory(prevHistory => {
        const nextTime = prevHistory.length > 0 ? prevHistory[prevHistory.length - 1].time + 1 : 0;
        const newData: HistoryData = {
          time: nextTime,
          ...nextVAD,
          emotion: getEmotionState(nextVAD),
          adrenaline: newHormones.adrenaline.current,
          cortisol: newHormones.cortisol.current,
          gaba: newHormones.gaba.current,
          dopamine: newHormones.dopamine.current,
          serotonin: newHormones.serotonin.current,
          testosterone: newHormones.testosterone.current,
          oxytocin: newHormones.oxytocin.current
        };
        
        const updatedHistory = prevHistory.length >= MAX_HISTORY 
          ? [...prevHistory.slice(1), newData]
          : [...prevHistory, newData];
          
        return updatedHistory;
      });
      
      return newHormones;
    });
  }, [calculateVAD, getEmotionState]);

  // 更新激素参数 - 使用useCallback优化
  // 添加防抖钩子用于参数更新
  const updateHormone = useCallback((hormone: HormoneKey, param: keyof Hormone, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    setHormones(prev => ({
      ...prev,
      [hormone]: {
        ...prev[hormone],
        [param]: numValue
      }
    }));
  }, []);

  // 在状态定义后添加缓存计算
  const currentVAD = useMemo(() => calculateVAD(hormones), [hormones, calculateVAD]);
  const currentEmotion = useMemo(() => getEmotionState(currentVAD), [currentVAD, getEmotionState]);
  
  const radarData = useMemo(() => [
    { subject: 'Arousal', value: currentVAD.arousal },
    { subject: 'Valence', value: currentVAD.valence },
    { subject: 'Dominance', value: currentVAD.dominance }
  ], [currentVAD]);

  // 添加语言状态
  const [language, setLanguage] = useState<Language>('zh');

  // 翻译函数
  const t = (hormoneKey: keyof typeof HORMONE_TRANSLATIONS) => {
    return HORMONE_TRANSLATIONS[hormoneKey][language];
  };

  // 切换语言
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 min-h-screen">
      <div className="space-y-6">
        {/* 标题 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">激素-情绪调节模拟器</h1>
          <p className="text-muted-foreground">
            基于VAD情感模型，模拟不同激素对情绪的影响
          </p>
        </div>
        <Card className="mb-6">
         
          <CardContent>
            <div className="grid grid-cols-1  gap-6">
              {/* 左侧 - 激素注入 */}
              <div>
              <h3 className="font-semibold text-lg mb-2">激素参数设置与注入</h3>
              <p className='text-sm text-gray-500 mb-4'>
                Force: 注入时的剂量  |  Decay: 衰减速率(越小衰减越快) |  Current: 当前激素水平
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                {HORMONE_KEYS.map(hormone => {
                  const params = hormones[hormone];
                  return (
                    <Card key={hormone} className="p-4 gap-4 relative">
                      {/* 激素名称 */}
                      <div className="flex justify-between items-start mb-0">
                        <div>
                          <h4 className="font-semibold text-sm" style={{ color: hormoneColors[hormone] }}>
                            {t(hormone as keyof typeof HORMONE_TRANSLATIONS)}
                          </h4>
                          <p className="text-xs text-gray-500 leading-tight mt-1">
                            {hormone === 'adrenaline' && '提升唤醒度和支配力'}
                            {hormone === 'cortisol' && '提升唤醒度，降低效价'}
                            {hormone === 'gaba' && '降低唤醒度，稳定情绪'}
                            {hormone === 'dopamine' && '提升所有情绪因子'}
                            {hormone === 'serotonin' && '提升效价和幸福感'}
                            {hormone === 'testosterone' && '提升支配力和攻击性'}
                            {hormone === 'oxytocin' && '提升亲和力和信任'}
                          </p>
                        </div>
                        <Button
                          onClick={() => injectHormone(hormone)}
                          className="text-xs px-3 py-1 h-auto"
                          style={{ backgroundColor: hormoneColors[hormone] }}
                          title={`注入 ${t(hormone as keyof typeof HORMONE_TRANSLATIONS)}`}
                        >
                          注入
                        </Button>
                      </div>
                      {/* 激素参数 */}
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs text-gray-600">Force: {params.force}</Label>
                          <Slider
                            min={0}
                            max={100}
                            value={[params.force]}
                            onValueChange={(value) => updateHormone(hormone, 'force', String(value[0]))}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Decay: {params.decay.toFixed(3)}</Label>
                          <Slider
                            min={0.8}
                            max={0.99}
                            step={0.01}
                            value={[params.decay]}
                            onValueChange={(value) => updateHormone(hormone, 'decay', String(value[0]))}
                            className="w-full"
                          />
                        </div>
                        <div className="text-xs text-gray-500">
                          Current: {params.current.toFixed(1)}
                        </div>
                        
                      </div>
                    </Card>
                  );
                })}
              </div>
              
            </div>
              {/* 运行按钮 */}
              <div className="flex gap-2">
                <Button onClick={() => setIsRunning(!isRunning)}>
                  {isRunning ? <Pause size={16} className="mr-2" /> : <Play size={16} className="mr-2" />}
                  {isRunning ? '暂停' : '开始'}
                </Button>
                <Button variant="outline" onClick={resetSimulation}>
                  <RotateCcw size={16} className="mr-2" />
                  重置
                </Button>
                <Button variant="outline" onClick={toggleLanguage}>
                  <Languages size={16} className="mr-2" />
                  {language === 'zh' ? 'EN' : '中文'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 当前状态和VAD因子 - 合并为一个卡片 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">当前状态与VAD因子</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 左侧：当前状态 (1/3) */}
              <div className="lg:col-span-1 space-y-4">
                <div className="text-3xl font-bold text-blue-600">{currentEmotion}</div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">Arousal:</span>
                    <span className="font-semibold text-red-600">{currentVAD.arousal.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">Valence:</span>
                    <span className="font-semibold text-green-600">{currentVAD.valence.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">Dominance:</span>
                    <span className="font-semibold text-blue-600">{currentVAD.dominance.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* 右侧：VAD因子雷达图 (2/3) */}
              <div className="lg:col-span-2">
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <PolarGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* 历史图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VAD历史 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">VAD因子历史</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart 
                data={history} 
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                isAnimationActive={true}
                animationDuration={300}
                animationEasing="linear"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="time" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  type="number"
                  domain={['dataMin', 'dataMax']}
                />
                <YAxis 
                  domain={[0, 100]} 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px' }}
                  fontSize={10}
                  iconType="line"
                />
                <Line 
                  type="monotone" 
                  dataKey="arousal" 
                  stroke="#ef4444" 
                  name="Arousal" 
                  strokeWidth={2} 
                  dot={false} 
                  activeDot={{ r: 4 }}
                  animationDuration={300}
                  animationEasing="linear"
                />
                <Line 
                  type="monotone" 
                  dataKey="valence" 
                  stroke="#22c55e" 
                  name="Valence" 
                  strokeWidth={2} 
                  dot={false} 
                  activeDot={{ r: 4 }}
                  animationDuration={300}
                  animationEasing="linear"
                />
                <Line 
                  type="monotone" 
                  dataKey="dominance" 
                  stroke="#3b82f6" 
                  name="Dominance" 
                  strokeWidth={2} 
                  dot={false} 
                  activeDot={{ r: 4 }}
                  animationDuration={300}
                  animationEasing="linear"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* 激素历史 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">激素水平历史</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart 
                data={history} 
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                isAnimationActive={true}
                animationDuration={300}
                animationEasing="linear"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="time" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  type="number"
                  domain={['dataMin', 'dataMax']}
                />
                <YAxis 
                  domain={[0, 100]} 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px' }}
                  iconType="line"
                />
                {HORMONE_KEYS.map(hormone => (
                  <Line 
                    key={hormone}
                    type="monotone" 
                    dataKey={hormone} 
                    stroke={hormoneColors[hormone]} 
                    name={t(hormone as keyof typeof HORMONE_TRANSLATIONS)}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    animationDuration={300}
                    animationEasing="linear"
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      </div>
    </div>
  );
};

export default HormoneEmotionSimulator;