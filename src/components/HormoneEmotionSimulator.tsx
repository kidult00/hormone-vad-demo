import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Play, Pause, RotateCcw } from 'lucide-react';


import { 
  HORMONE_KEYS, 
  hormoneColors
} from '@/constants/hormone';
import { Languages } from 'lucide-react';
import { HORMONE_TRANSLATIONS, type Language } from '@/constants/translations';
import { useHormoneSimulation } from '@/hooks/useHormoneSimulation';
import { formatRadarData } from '@/utils/hormoneCalculations';

const HormoneEmotionSimulator = () => {
  const {
    hormones,
    isRunning,
    history,
    currentVAD,
    currentEmotion,
    setIsRunning,
    resetSimulation,
    injectHormone,
    updateHormone,
  } = useHormoneSimulation();

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

  // 使用工具函数格式化雷达图数据
  const radarData = useMemo(() => formatRadarData(currentVAD), [currentVAD]);

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
                            onValueChange={(value) => updateHormone(hormone, 'force', value[0])}
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
                            onValueChange={(value) => updateHormone(hormone, 'decay', value[0])}
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