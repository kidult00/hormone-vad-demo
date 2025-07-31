// 激素类型定义
export type HormoneKey = 'adrenaline' | 'cortisol' | 'gaba' | 'dopamine' | 'serotonin' | 'testosterone' | 'oxytocin';

export interface Hormone {
  current: number;
  force: number;
  decay: number;
}

export type Hormones = Record<HormoneKey, Hormone>;

export interface VAD {
  arousal: number;
  valence: number;
  dominance: number;
}

export interface HistoryData extends VAD {
  time: number;
  emotion: string;
  adrenaline: number;
  cortisol: number;
  gaba: number;
  dopamine: number;
  serotonin: number;
  testosterone: number;
  oxytocin: number;
}