import { Platform, type ViewStyle } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

/** 앱은 촘촘하게, 웹은 여유 있게 */
export const space = {
  screenX: Platform.select({ web: 28, default: 16 })!,
  screenTop: Platform.select({ web: 20, default: 4 })!,
  screenBottom: Platform.select({ web: 48, default: 28 })!,
  section: Platform.select({ web: 36, default: 28 })!,
  headerBottom: Platform.select({ web: 28, default: 20 })!,
  cardGap: Platform.select({ web: 14, default: 10 })!,
  cardPad: Platform.select({ web: 20, default: 14 })!,
} as const;

export const typeScale = {
  pageTitle: Platform.select({ web: 30, default: 24 })!,
  pageTitleLine: Platform.select({ web: 38, default: 32 })!,
  pageSub: Platform.select({ web: 15, default: 13 })!,
  pageSubLine: Platform.select({ web: 24, default: 20 })!,
  sectionTitle: Platform.select({ web: 18, default: 17 })!,
  sectionTitleLine: Platform.select({ web: 26, default: 24 })!,
  heroName: Platform.select({ web: 28, default: 24 })!,
  heroNameLine: Platform.select({ web: 36, default: 32 })!,
  cardName: Platform.select({ web: 20, default: 17 })!,
  cardNameLine: Platform.select({ web: 28, default: 24 })!,
} as const;

export const metrics = {
  parentPhoto: Platform.select({ web: 92, default: 76 })!,
  parentDetailPhoto: Platform.select({ web: 112, default: 96 })!,
  anniversaryEmoji: Platform.select({ web: 48, default: 44 })!,
  webMaxWidth: 720,
  tabBarBaseHeight: Platform.select({ ios: 52, android: 56, default: 56 })!,
} as const;

/** 웹에서만 중앙 정렬 + 최대 너비 */
export const webContentFrame: ViewStyle = isWeb
  ? {
      width: '100%',
      maxWidth: metrics.webMaxWidth,
      alignSelf: 'center',
    }
  : {};
