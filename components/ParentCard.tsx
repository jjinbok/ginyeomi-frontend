import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { softRiseStagger } from '@/constants/motion';
import { metrics, space, typeScale } from '@/constants/layout';
import { colors, fonts, layout } from '@/constants/theme';
import type { Parent } from '@/types';
import {
  getDaysUntilBirthday,
  getParentDisplayEmoji,
  getParentRelationLabel,
} from '@/utils/parent';

interface ParentCardProps {
  parent: Parent;
  onPress: () => void;
  enterIndex?: number;
}

export function ParentCard({ parent, onPress, enterIndex = 0 }: ParentCardProps) {
  const relationLabel = getParentRelationLabel(parent);
  const emoji = getParentDisplayEmoji(parent);
  const daysUntilBirthday = getDaysUntilBirthday(parent.birthDate);
  const isUpcoming = daysUntilBirthday <= 30;
  const photo = metrics.parentPhoto;

  return (
    <Animated.View
      style={styles.wrap}
      entering={softRiseStagger(enterIndex, 80)}
    >
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        onPress={onPress}
      >
      <View style={styles.photoArea}>
        {parent.profileImageUrl ? (
          <Image
            source={{ uri: parent.profileImageUrl }}
            style={{ width: photo, height: photo, borderRadius: photo / 2 }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.photoPlaceholder,
              { width: photo, height: photo, borderRadius: photo / 2 },
            ]}
          >
            <Text style={styles.photoEmoji}>{emoji}</Text>
          </View>
        )}
      </View>
      <Text style={styles.relation} numberOfLines={1}>
        {relationLabel}
      </Text>
      <Text style={styles.name} numberOfLines={1}>
        {parent.name}
      </Text>
      <View style={styles.ddayBlock}>
        {isUpcoming ? (
          <>
            <Text style={styles.ddayValue}>
              {daysUntilBirthday === 0 ? '오늘' : daysUntilBirthday}
            </Text>
            {daysUntilBirthday > 0 ? (
              <Text style={styles.ddayHint}>일 전 생신</Text>
            ) : (
              <Text style={styles.ddayHint}>생신이에요</Text>
            )}
          </>
        ) : (
          <>
            <Text style={styles.ddayValueMuted}>{daysUntilBirthday}</Text>
            <Text style={styles.ddayHintMuted}>일 뒤 생신</Text>
          </>
        )}
      </View>
    </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minWidth: 0,
  },
  card: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    paddingVertical: space.cardPad + 4,
    paddingHorizontal: space.cardPad - 2,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.88,
  },
  photoArea: {
    marginBottom: 12,
  },
  photoPlaceholder: {
    backgroundColor: colors.tagBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmoji: {
    fontSize: metrics.parentPhoto * 0.45,
  },
  relation: {
    fontSize: 12,
    color: colors.accent,
    fontFamily: fonts.sans,
    fontWeight: '500',
    marginBottom: 4,
  },
  name: {
    fontSize: typeScale.cardName,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    lineHeight: typeScale.cardNameLine,
    marginBottom: 10,
    maxWidth: '100%',
  },
  ddayBlock: {
    alignItems: 'center',
    maxWidth: '100%',
  },
  ddayValue: {
    fontSize: 20,
    fontFamily: fonts.serif,
    color: colors.accent,
    lineHeight: 26,
  },
  ddayValueMuted: {
    fontSize: 18,
    fontFamily: fonts.serif,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  ddayHint: {
    fontSize: 11,
    fontFamily: fonts.sans,
    color: colors.textMuted,
    marginTop: 2,
  },
  ddayHintMuted: {
    fontSize: 11,
    fontFamily: fonts.sans,
    color: colors.textHint,
    marginTop: 2,
  },
});
