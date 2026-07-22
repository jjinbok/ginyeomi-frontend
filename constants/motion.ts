import { Easing, FadeIn, FadeInUp } from 'react-native-reanimated';

/** 감성용 — 아래에서 천천히 떠오름 */
const riseEasing = Easing.bezier(0.22, 1, 0.36, 1);

/** 카드·리스트 한 칸 */
export function softRise(delayMs = 0) {
  return FadeInUp.delay(delayMs)
    .duration(560)
    .easing(riseEasing);
}

/** 연도/목록 순차 등장 */
export function softRiseStagger(index: number, stepMs = 95) {
  return softRise(Math.min(index, 8) * stepMs);
}

/** 섹션·히어로처럼 살짝만 */
export function softFade(delayMs = 0) {
  return FadeIn.delay(delayMs).duration(480).easing(riseEasing);
}

export const motion = {
  /** 시트/다이얼로그 등장 */
  modalMs: 420,
  modalEasing: riseEasing,
  sheetTravel: 36,
  dialogTravel: 14,
  /** 프레스 */
  pressDamping: 20,
  pressStiffness: 180,
} as const;
