export const colors = {
  background: '#FAF7F2',
  surface: '#FFFFFF',
  border: '#EDE6DA',
  borderDashed: '#C4B8A8',
  textPrimary: '#2C2416',
  textSecondary: '#4A3F30',
  textMuted: '#9C8F7A',
  textHint: '#B5A899',
  accent: '#C47A5A',
  tagBackground: '#F5EFE6',
  photoPlaceholder: '#F0E9DF',
  chipBackground: '#F5EFE6',
} as const;

export const fonts = {
  serif: 'NotoSerifKR',
  sans: 'NotoSansKR',
} as const;

export const typography = {
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    color: colors.textHint,
    fontFamily: fonts.sans,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.textPrimary,
    fontFamily: fonts.sans,
  },
  memo: {
    fontSize: 14,
    fontWeight: '300' as const,
    color: colors.textSecondary,
    fontFamily: fonts.serif,
  },
  bodySmall: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: fonts.sans,
  },
  bodyMedium: {
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: fonts.sans,
  },
} as const;

export const layout = {
  cardRadius: 16,
  chipRadius: 20,
  fabSize: 52,
  borderWidth: 0.5,
} as const;
