import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
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

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.photoArea}>
        {parent.profileImageUrl ? (
          <Image source={{ uri: parent.profileImageUrl }} style={styles.photo} resizeMode="cover" />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoEmoji}>{emoji}</Text>
          </View>
        )}
      </View>
      <Text style={styles.relation}>{relationLabel}</Text>
      <Text style={styles.name}>{parent.name}</Text>
      <View style={[styles.badge, isUpcoming ? styles.badgeAccent : styles.badgeMuted]}>
        <Text style={[styles.badgeText, isUpcoming ? styles.badgeTextAccent : styles.badgeTextMuted]}>
          {isUpcoming ? `생신 D-${daysUntilBirthday}` : `생신까지 ${daysUntilBirthday}일`}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    padding: 20,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  photoArea: {
    marginBottom: 16,
  },
  photo: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  photoPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.tagBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmoji: {
    fontSize: 40,
  },
  relation: {
    fontSize: 12,
    color: colors.textHint,
    fontFamily: fonts.sans,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  badge: {
    borderRadius: layout.chipRadius,
    paddingHorizontal: 12,
    paddingVertical: 5,
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
