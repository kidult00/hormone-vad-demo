import type { VAD, Hormones } from '@/types/hormone';

// 情绪数据类型定义
interface EmotionData {
  emotion: string;
  valence: number;
  dominance: number;
  arousal: number;
}

// 从emotion_vad.json动态导入情绪数据库
import emotionData from '../../data/emotion_vad.json';

// 使用导入的数据
const EMOTION_DATABASE: EmotionData[] = emotionData;

/**
 * VAD维度权重配置（基于数据标准差）
 */
const VAD_WEIGHTS = {
  valence: 0.4,    // 效价权重最高，区分正负情绪
  dominance: 0.35, // 支配力权重中等
  arousal: 0.25    // 唤醒度权重较低
};

/**
 * KNN算法参数
 */
const KNN_CONFIG = {
  k: 3,              // 近邻数量
  maxDistance: 0.8,  // 最大距离阈值
  confidenceThreshold: 0.6  // 置信度阈值
};

/**
 * 激素计算工具库
 * 提供VAD计算、情绪判断、数值处理等核心功能
 */

/**
 * 根据激素水平计算VAD因子
 * @param hormones - 当前激素水平
 * @returns VAD三维情绪因子
 */
export const calculateVAD = (hormones: Hormones): VAD => {
  // Arousal: 唤醒度 (肾上腺素 + 皮质醇 - GABA + 多巴胺*0.3)
  const arousal = Math.max(0, Math.min(100, 
    hormones.adrenaline.current + 
    hormones.cortisol.current - 
    hormones.gaba.current + 
    hormones.dopamine.current * 0.3
  ));
  
  // Valence: 效价 (血清素 + 多巴胺*0.7 + 催产素*0.5 - 皮质醇*0.3)
  const valence = Math.max(0, Math.min(100,
    hormones.serotonin.current +
    hormones.dopamine.current * 0.7 +
    hormones.oxytocin.current * 0.5 -
    hormones.cortisol.current * 0.3
  ));
  
  // Dominance: 支配力 (睾酮 + 多巴胺*0.4 - 催产素*0.3 + 肾上腺素*0.2)
  const dominance = Math.max(0, Math.min(100,
    hormones.testosterone.current +
    hormones.dopamine.current * 0.4 -
    hormones.oxytocin.current * 0.3 +
    hormones.adrenaline.current * 0.2
  ));
  
  return { arousal, valence, dominance };
};

/**
 * 计算加权欧氏距离
 * @param target - 目标VAD值
 * @param source - 源情绪数据
 * @returns 加权距离
 */
const calculateWeightedDistance = (
  target: { valence: number; dominance: number; arousal: number },
  source: { valence: number; dominance: number; arousal: number }
): number => {
  const valenceDiff = (target.valence - source.valence) * VAD_WEIGHTS.valence;
  const dominanceDiff = (target.dominance - source.dominance) * VAD_WEIGHTS.dominance;
  const arousalDiff = (target.arousal - source.arousal) * VAD_WEIGHTS.arousal;
  
  return Math.sqrt(valenceDiff ** 2 + dominanceDiff ** 2 + arousalDiff ** 2);
};

/**
 * 根据VAD值判断情绪状态
 * 使用改进的K-近邻算法(KNN)进行情绪识别
 * 包含置信度计算和异常值处理
 * @param vad - VAD因子（0-100范围）
 * @returns 最匹配的情绪状态
 */
export const getEmotionState = (vad: VAD): string => {
  // 将0-100映射到-1到1区间，与emotion_vad.json数据一致
  const normalizedVad = {
    valence: (vad.valence - 50) / 50,
    dominance: (vad.dominance - 50) / 50,
    arousal: vad.arousal / 100
  };

  // 计算与所有情绪的距离
  const distances = EMOTION_DATABASE.map(emotion => ({
    distance: calculateWeightedDistance(normalizedVad, emotion),
    ...emotion
  }));

  // 按距离排序并获取最近的K个
  const kNearest = distances
    .sort((a, b) => a.distance - b.distance)
    .slice(0, KNN_CONFIG.k);

  // 异常值检测：如果最近的距离过大，返回中性情绪
  const minDistance = kNearest[0]?.distance ?? Infinity;
  if (minDistance > KNN_CONFIG.maxDistance) {
    return "平静/孤独/空虚";
  }

  // 使用加权投票决定最终情绪
  const totalWeight = kNearest.reduce((sum, item) => sum + 1 / (item.distance + 0.1), 0);
  const weightedEmotions = kNearest.map(item => ({
    emotion: item.emotion,
    weight: (1 / (item.distance + 0.1)) / totalWeight
  }));

  // 返回权重最大的情绪
  const finalEmotion = weightedEmotions.reduce((max, current) => 
    current.weight > max.weight ? current : max
  );

  return finalEmotion.emotion;
};

/**
 * 获取情绪识别详情（包含置信度）
 * @param vad - VAD因子（0-100范围）
 * @returns 情绪识别结果和置信度
 */
export const getEmotionStateWithConfidence = (vad: VAD): {
  emotion: string;
  confidence: number;
  alternatives: Array<{ emotion: string; confidence: number }>;
} => {
  const normalizedVad = {
    valence: (vad.valence - 50) / 50,
    dominance: (vad.dominance - 50) / 50,
    arousal: vad.arousal / 100
  };

  const distances = EMOTION_DATABASE.map(emotion => ({
    distance: calculateWeightedDistance(normalizedVad, emotion),
    ...emotion
  }));

  const kNearest = distances
    .sort((a, b) => a.distance - b.distance)
    .slice(0, KNN_CONFIG.k);

  // 计算置信度
  const minDistance = kNearest[0]?.distance ?? Infinity;
  const maxConfidence = 0.9;
  const minConfidence = 0.3;
  
  let confidence = Math.max(
    0,
    maxConfidence - (minDistance / KNN_CONFIG.maxDistance) * (maxConfidence - minConfidence)
  );

  // 异常值处理
  if (minDistance > KNN_CONFIG.maxDistance) {
    return {
      emotion: "平静/孤独/空虚",
      confidence: 1.0,
      alternatives: []
    };
  }

  // 计算加权结果
  const totalWeight = kNearest.reduce((sum, item) => sum + 1 / (item.distance + 0.1), 0);
  const weightedEmotions = kNearest.map(item => ({
    emotion: item.emotion,
    confidence: (1 / (item.distance + 0.1)) / totalWeight
  }));

  const finalEmotion = weightedEmotions[0];

  return {
    emotion: finalEmotion.emotion,
    confidence: Math.min(confidence, finalEmotion.confidence),
    alternatives: weightedEmotions.slice(1, 3).map(item => ({
      emotion: item.emotion,
      confidence: Math.min(confidence * 0.8, item.confidence)
    }))
  };
}

/**
 * 数值边界检查工具函数
 * @param value - 输入值
 * @param min - 最小值
 * @param max - 最大值
 * @returns 限制在边界内的值
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

/**
 * 激素衰减边界检查
 * @param decay - 衰减系数
 * @returns 合法的衰减系数 (0.8-0.99)
 */
export const clampDecay = (decay: number): number => {
  return clamp(decay, 0.8, 0.99);
};

/**
 * 激素水平边界检查
 * @param level - 激素水平
 * @returns 合法的激素水平 (0-100)
 */
export const clampHormoneLevel = (level: number): number => {
  return clamp(level, 0, 100);
};

/**
 * 格式化VAD值为雷达图数据
 * @param vad - VAD因子
 * @returns 雷达图格式数据
 */
/**
 * 将VAD值转换为雷达图数据格式
 * @param vad - VAD三维情绪模型数据
 * @returns 雷达图所需的数据格式
 */
export const formatRadarData = (vad: VAD) => [
  { subject: 'Arousal', value: vad.arousal },
  { subject: 'Valence', value: vad.valence },
  { subject: 'Dominance', value: vad.dominance },
];

/**
 * 计算激素变化率
 * @param current - 当前值
 * @param decay - 衰减系数
 * @returns 下一时刻的值
 */
export const calculateNextHormoneLevel = (current: number, decay: number): number => {
  return clampHormoneLevel(current * decay);
};

/**
 * 情绪强度评估
 * @param vad - VAD因子
 * @returns 情绪强度等级 (0-100)
 */
export const calculateEmotionIntensity = (vad: VAD): number => {
  const distanceFromCenter = Math.sqrt(
    Math.pow(vad.arousal - 50, 2) +
    Math.pow(vad.valence - 50, 2) +
    Math.pow(vad.dominance - 50, 2)
  );
  
  return clampHormoneLevel(distanceFromCenter / Math.sqrt(3));
};

/**
 * 检查是否达到情绪阈值
 * @param vad - VAD因子
 * @param threshold - 阈值 (默认80)
 * @returns 是否达到强烈情绪
 */
export const isIntenseEmotion = (vad: VAD, threshold: number = 80): boolean => {
  return vad.arousal > threshold || vad.valence > threshold || vad.dominance > threshold;
};