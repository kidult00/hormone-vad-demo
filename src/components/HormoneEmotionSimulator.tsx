import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Play, Pause, RotateCcw, Languages } from 'lucide-react';

import { HORMONE_KEYS, hormoneColors } from '@/constants/hormone';
import { HORMONE_TRANSLATIONS, type Language } from '@/constants/translations';
import { useHormoneSimulation } from '@/hooks/useHormoneSimulation';
import { VADRadarChart, VADHistoryChart, HormoneHistoryChart } from '@/components/charts';

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
                          className="text-xs px-3 py-1 h-auto cursor-pointer"
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
                            className="w-full cursor-pointer"
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
                            className="w-full cursor-pointer"
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
                <Button onClick={() => setIsRunning(!isRunning)} className="cursor-pointer">
                  {isRunning ? <Pause size={16} className="mr-2" /> : <Play size={16} className="mr-2" />}
                  {isRunning ? '暂停' : '开始'}
                </Button>
                <Button variant="outline" onClick={resetSimulation} className="cursor-pointer">
                  <RotateCcw size={16} className="mr-2" />
                  重置
                </Button>
                <Button variant="outline" onClick={toggleLanguage} className="cursor-pointer">
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
                <VADRadarChart vad={currentVAD} />
              </div>
            </div>
          </CardContent>
        </Card>

      {/* 历史图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VAD历史 */}
        <VADHistoryChart data={history} />
        
        {/* 激素历史 */}
        <HormoneHistoryChart data={history} language={language} />
      </div>

      </div>
    </div>
  );
};

export default HormoneEmotionSimulator;