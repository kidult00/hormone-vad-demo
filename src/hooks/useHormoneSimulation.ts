import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { HormoneKey, Hormones, VAD, HistoryData } from '@/types/hormone';
import { 
  calculateVAD, 
  getEmotionState, 
  clampHormoneLevel,
  clampDecay 
} from '@/utils/hormoneCalculations';
import { 
  MAX_HISTORY, 
  UPDATE_INTERVAL, 
  initialHormones 
} from '@/constants/hormone';

/**
 * 激素-情绪模拟的核心业务逻辑Hook
 * 使用hormoneCalculations中的工具函数避免重复实现
 */
export const useHormoneSimulation = () => {
  // 激素参数状态
  const [hormones, setHormones] = useState<Hormones>(initialHormones);
  // 模拟控制
  const [isRunning, setIsRunning] = useState(false);
  // 历史数据
  const [history, setHistory] = useState<HistoryData[]>([]);
  
  const intervalRef = useRef<number | null>(null);

  /**
   * 创建历史数据对象 - 统一数据结构
   * 将激素数据和VAD数据整合为历史记录格式
   */
  const createHistoryData = useCallback((hormonesData: Hormones, vad: VAD): HistoryData => {
    return {
      time: 0,
      ...vad,
      emotion: getEmotionState(vad),
      adrenaline: hormonesData.adrenaline.current,
      cortisol: hormonesData.cortisol.current,
      gaba: hormonesData.gaba.current,
      dopamine: hormonesData.dopamine.current,
      serotonin: hormonesData.serotonin.current,
      testosterone: hormonesData.testosterone.current,
      oxytocin: hormonesData.oxytocin.current
    };
  }, []);

  /**
   * 单步模拟 - 更新激素衰减并记录历史
   * 使用批量更新减少重渲染次数
   */
  const simulateStep = useCallback(() => {
    setHormones(prevHormones => {
      const newHormones = { ...prevHormones };
      
      // 批量更新所有激素的衰减
      Object.keys(newHormones).forEach(key => {
        const hormoneKey = key as HormoneKey;
        const hormone = newHormones[hormoneKey];
        const decayedValue = hormone.current * hormone.decay;
        newHormones[hormoneKey] = {
          ...hormone,
          current: clampHormoneLevel(decayedValue)
        };
      });
      
      // 计算新的VAD值
      const newVAD = calculateVAD(newHormones);
      
      // 更新历史数据
      setHistory(prevHistory => {
        const lastTime = prevHistory.length > 0 ? prevHistory[prevHistory.length - 1].time : 0;
        const newData = createHistoryData(newHormones, newVAD);
        newData.time = lastTime + 1;
        
        // 限制历史数据长度
        return prevHistory.length >= MAX_HISTORY 
          ? [...prevHistory.slice(1), newData]
          : [...prevHistory, newData];
      });
      
      return newHormones;
    });
  }, [createHistoryData]);

  /**
   * 重置模拟 - 恢复到初始状态
   */
  const resetSimulation = useCallback(() => {
    setIsRunning(false);
    setHormones(initialHormones);
    
    // 重新初始化历史数据
    const initialVAD = calculateVAD(initialHormones);
    const initialData = createHistoryData(initialHormones, initialVAD);
    setHistory([initialData]);
  }, [createHistoryData]);

  /**
   * 注入激素 - 立即增加指定激素的当前值
   * 仅在模拟运行时更新历史数据
   */
  const injectHormone = useCallback((hormone: HormoneKey) => {
    setHormones(prev => {
      const newHormones = {
        ...prev,
        [hormone]: {
          ...prev[hormone],
          current: clampHormoneLevel(prev[hormone].current + prev[hormone].force)
        }
      };
      
      // 仅在模拟运行时更新历史数据
      if (isRunning) {
        const nextVAD = calculateVAD(newHormones);
        setHistory(prevHistory => {
          const nextTime = prevHistory.length > 0 ? prevHistory[prevHistory.length - 1].time + 1 : 0;
          const newData = createHistoryData(newHormones, nextVAD);
          newData.time = nextTime;
          
          const updatedHistory = prevHistory.length >= MAX_HISTORY 
            ? [...prevHistory.slice(1), newData]
            : [...prevHistory, newData];
            
          return updatedHistory;
        });
      }
      
      return newHormones;
    });
  }, [createHistoryData, isRunning]);

  /**
   * 更新激素参数 - 修改force或decay值
   */
  const updateHormone = useCallback((hormone: HormoneKey, param: 'force' | 'decay', value: number) => {
    const clampedValue = param === 'decay' 
      ? clampDecay(value)
      : clampHormoneLevel(value);
    
    setHormones(prev => ({
      ...prev,
      [hormone]: {
        ...prev[hormone],
        [param]: clampedValue
      }
    }));
  }, []);

  // 初始化历史数据
  useEffect(() => {
    const initialVAD = calculateVAD(initialHormones);
    const initialData = createHistoryData(initialHormones, initialVAD);
    setHistory([initialData]);
  }, [createHistoryData]);

  // 模拟控制 - 启动/停止定时器
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(simulateStep, UPDATE_INTERVAL);
    } else {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, simulateStep]);

  // 计算当前VAD和情绪状态
  const currentVAD = useMemo(() => calculateVAD(hormones), [hormones]);
  const currentEmotion = useMemo(() => getEmotionState(currentVAD), [currentVAD]);

  return {
    // 状态
    hormones,
    isRunning,
    history,
    currentVAD,
    currentEmotion,
    
    // 控制函数
    setIsRunning,
    resetSimulation,
    injectHormone,
    updateHormone,
  };
};