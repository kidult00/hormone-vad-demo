// 激素相关常量
export const MAX_HISTORY = 100;
export const UPDATE_INTERVAL = 1000;

export const HORMONE_KEYS = [
  'adrenaline', 
  'cortisol', 
  'gaba', 
  'dopamine', 
  'serotonin', 
  'testosterone', 
  'oxytocin'
] as const;

export const hormoneColors: Record<string, string> = {
  adrenaline: '#ef4444',
  cortisol: '#f97316',
  gaba: '#8b5cf6',
  dopamine: '#f59e0b',
  serotonin: '#06b6d4',
  testosterone: '#10b981',
  oxytocin: '#ec4899'
};

export const initialHormones = {
  adrenaline: { current: 25, force: 15, decay: 0.98 },
  cortisol: { current: 35, force: 20, decay: 0.99 },
  gaba: { current: 45, force: 25, decay: 0.97 },
  dopamine: { current: 40, force: 18, decay: 0.985 },
  serotonin: { current: 50, force: 12, decay: 0.99 },
  testosterone: { current: 30, force: 22, decay: 0.975 },
  oxytocin: { current: 35, force: 16, decay: 0.98 }
};