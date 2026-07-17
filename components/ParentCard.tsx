import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
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
}

export function ParentCard({ parent, onPress }: ParentCardProps) {
  const relationLabel = getParentRelationLabel(parent);
  const emoji = getParentDisplayEmoji(parent);
  const daysUntilBirthday = getDaysUntilBirthday(parent.birthDate);
  const isUpcoming = daysUntilBirthday <= 30;
  const photo = metrics.parentPhoto;

  return (
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
      <View style={[styles.badge, isUpcoming ? styles.badgeAccent : styles.badgeMuted]}>
        <Text
          style={[styles.badgeText, isUpcoming ? styles.badgeTextAccent : styles.badgeTextMuted]}
          numberOfLines={1}
        >
          {isUpcoming
            ? `생신 ${daysUntilBirthday}일 전`
            : `생신까지 ${daysUntilBirthday}일`}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  badge: {
    borderRadius: layout.chipRadius,
    paddingHorizontal: 10,
    paddingVertical: 5,
    maxWidth: '100%',
  },
  badgeAccent: {
    backgroundColor: colors.accent,
  },
  badgeMuted: {
    backgroundColor: colors.tagBackground,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: fonts.sans,
    fontWeight: '500',
  },
  badgeTextAccent: {
    color: colors.surface,
  },
  badgeTextMuted: {
    color: colors.textMuted,
  },
});
