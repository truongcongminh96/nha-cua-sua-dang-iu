import type { PetState } from '../pet/types';
import type { TimeMode } from '../systems/TimeOfDay';

// UI wording is independent of the scene, pet behavior, and book content.
export const roomStatuses: Record<TimeMode, string> = {
  day: '阳光照进来了。', golden: '窗外是黄昏。', night: '灯还亮着。',
};
export const petStatuses: Record<PetState, string> = {
  sleep: '在睡觉', wake: '刚醒来', stretch: '伸懒腰', walk: '在散步', climb: '在爬架子',
  glide: '在滑翔', jump: '轻轻一跳', inspect: '在闻一闻', eat: '在吃水果', groom: '在梳毛', idle: '在发呆',
};
