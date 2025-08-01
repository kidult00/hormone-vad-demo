import type { Hormones, VAD } from '@/types/hormone';

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
 * 根据VAD值判断情绪状态
 * 基于Russell的环形情绪模型和VAD三维理论
 * @param vad - VAD因子
 * @returns 情绪状态描述
 */
export const getEmotionState = (vad: VAD): string => {
  const { arousal, valence, dominance } = vad;
  
  // 高唤醒高valence高dominance -> 兴奋
  if (valence > 70 && arousal > 70 && dominance > 60) return "兴奋";
  
  // 低唤醒高valence中dominance -> 满足
  if (valence > 70 && arousal < 40 && dominance > 50) return "满足";
  
  // 高唤醒低valence低dominance -> 焦虑
  if (valence < 30 && arousal > 70 && dominance < 40) return "焦虑";
  
  // 低唤醒低valence低dominance -> 抑郁
  if (valence < 30 && arousal < 40 && dominance < 40) return "抑郁";
  
  // 中唤醒高valence低dominance -> 愉悦
  if (valence > 60 && arousal > 60 && dominance < 40) return "愉悦";
  
  // 高唤醒低valence高dominance -> 愤怒
  if (valence < 40 && arousal > 60 && dominance > 60) return "愤怒";
  
  // 低唤醒中valence低dominance -> 平静
  if (valence > 50 && arousal < 50 && dominance < 50) return "平静";
  
  return "复杂";
};

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