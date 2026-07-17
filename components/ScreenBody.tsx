import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { space, webContentFrame } from '@/constants/layout';
import { colors } from '@/constants/theme';

interface ScreenBodyProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** FlatList contentContainerStyle용 — View 래퍼 없이 스타일만 */
  contentOnly?: boolean;
}

/** 탭/상세 공통 본문 패딩 + 웹 최대 너비 */
export function getScreenContentStyle(extra?: StyleProp<ViewStyle>): StyleProp<ViewStyle> {
  return [styles.content, webContentFrame, extra];
}

export function ScreenBody({ children, style }: ScreenBodyProps) {
  return <View style={[styles.content, webContentFrame, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    width: '100%',
    paddingHorizontal: space.screenX,
    paddingTop: space.screenTop,
    paddingBottom: space.screenBottom,
    backgroundColor: colors.background,
  },
});
