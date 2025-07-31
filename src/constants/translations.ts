// 激素中英文对照表
export const HORMONE_TRANSLATIONS = {
  adrenaline: {
    zh: '肾上腺素',
    en: 'Adrenaline'
  },
  cortisol: {
    zh: '皮质醇',
    en: 'Cortisol'
  },
  gaba: {
    zh: 'GABA',
    en: 'GABA'
  },
  dopamine: {
    zh: '多巴胺',
    en: 'Dopamine'
  },
  serotonin: {
    zh: '血清素',
    en: 'Serotonin'
  },
  testosterone: {
    zh: '睾酮',
    en: 'Testosterone'
  },
  oxytocin: {
    zh: '催产素',
    en: 'Oxytocin'
  }
} as const;

export type Language = 'zh' | 'en';