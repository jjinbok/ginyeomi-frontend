import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { showApiErrorAlert } from '@/api/errors';
import { AnimatedModal } from '@/components/AnimatedModal';
import { MonthDayPicker } from '@/components/MonthDayPicker';
import { YearPicker } from '@/components/YearPicker';
import { PARENT_RELATIONS } from '@/constants/parents';
import { colors, fonts, layout, typography } from '@/constants/theme';
import { useCreateParent, useUpdateParent } from '@/hooks/useParents';
import type { Parent, ParentRelation } from '@/types';

interface ParentAddModalProps {
  visible: boolean;
  relation: ParentRelation;
  onClose: () => void;
  onSuccess?: (parent?: Parent) => void;
  editingParent?: Parent | null;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function toBirthDate(year: number, month: number, day: number) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function parseBirthDate(birthDate: string) {
  const [year, month, day] = birthDate.split('-').map(Number);
  return { year, month, day };
}

export function ParentAddModal({
  visible,
  relation,
  onClose,
  onSuccess,
  editingParent,
}: ParentAddModalProps) {
  const createMutation = useCreateParent();
  const updateMutation = useUpdateParent();
  const isEditMode = !!editingParent;
  const relationInfo = PARENT_RELATIONS[relation];

  const currentYear = new Date().getFullYear();
  const [name, setName] = useState('');
  const [year, setYear] = useState(1960);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [lunarBirth, setLunarBirth] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState('');

  const resetForm = useCallback(() => {
    setName('');
    setYear(1960);
    setMonth(1);
    setDay(1);
    setLunarBirth(false);
    setProfileImageUrl('');
  }, []);

  useEffect(() => {
    if (!visible) return;

    if (editingParent) {
      const parsed = parseBirthDate(editingParent.birthDate);
      setName(editingParent.name);
      setYear(parsed.year);
      setMonth(parsed.month);
      setDay(parsed.day);
      setLunarBirth(editingParent.lunarBirth);
      setProfileImageUrl(editingParent.profileImageUrl ?? '');
    } else {
      resetForm();
    }
  }, [visible, editingParent, resetForm]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleDateChange = useCallback((nextMonth: number, nextDay: number) => {
    setMonth(nextMonth);
    setDay(nextDay);
  }, []);

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    try {
      let result: Parent;

      if (isEditMode && editingParent) {
        result = await updateMutation.mutateAsync({
          parentId: editingParent.id,
          payload: {
            profileImageUrl: profileImageUrl.trim() || null,
          },
        });
      } else {
        result = await createMutation.mutateAsync({
          name: name.trim(),
          relation,
          birthDate: toBirthDate(year, month, day),
          lunarBirth,
          profileImageUrl: profileImageUrl.trim() || null,
        });
        resetForm();
      }

      onSuccess?.(result);
      onClose();
    } catch (error) {
      showApiErrorAlert('저장 실패', error, '부모님 정보를 저장하지 못했습니다.');
    }
  };

  return (
    <AnimatedModal
      visible={visible}
      onRequestClose={handleClose}
      variant="sheet"
      backdropColor="rgba(44, 36, 22, 0.35)"
    >
      <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.title}>
            {isEditMode
              ? `${relationInfo.formalLabel} 정보 수정`
              : `${relationInfo.formalLabel} 추가`}
          </Text>

          <View style={styles.body}>
            <View style={styles.nameRow}>
              <View style={styles.emojiBadge}>
                <Text style={styles.emojiBadgeText}>{relationInfo.emoji}</Text>
              </View>
              <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                placeholder="성함"
                placeholderTextColor={colors.textHint}
                editable={!isEditMode}
              />
            </View>

            {isEditMode ? (
              <Text style={styles.editNotice}>
                이름·생일은 수정할 수 없어요. 프로필 사진 URL만 변경할 수 있습니다.
              </Text>
            ) : null}

            {!isEditMode && (
              <>
                <Text style={[typography.sectionLabel, styles.sectionGap]}>생년월일</Text>
                <View style={styles.yearRow}>
                  <Text style={styles.yearLabel}>출생 연도</Text>
                  <YearPicker
                    value={year}
                    onChange={setYear}
                    minYear={1920}
                    maxYear={currentYear}
                    compact
                  />
                </View>
                <MonthDayPicker month={month} day={day} onChange={handleDateChange} />

                <View style={styles.toggleRow}>
                  <View style={styles.toggleCopy}>
                    <Text style={styles.toggleLabel}>음력 생일</Text>
                    <Text style={styles.toggleHint}>음력으로 생일을 기록해요</Text>
                  </View>
                  <Switch
                    value={lunarBirth}
                    onValueChange={setLunarBirth}
                    trackColor={{ false: colors.border, true: colors.accent }}
                  />
                </View>
              </>
            )}

            <Text style={[typography.sectionLabel, styles.sectionGap]}>프로필 사진 URL (선택)</Text>
            <TextInput
              style={styles.urlInput}
              value={profileImageUrl}
              onChangeText={setProfileImageUrl}
              placeholder="https://..."
              placeholderTextColor={colors.textHint}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.footer}>
            <Pressable
              style={[styles.saveButton, (!name.trim() || isPending) && styles.saveDisabled]}
              onPress={handleSave}
              disabled={!name.trim() || isPending}
            >
              {isPending ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.saveText}>
                  {isEditMode ? '수정하기' : '저장하기'}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
    </AnimatedModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderDashed,
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  body: {
    gap: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  emojiBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.tagBackground,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBadgeText: {
    fontSize: 22,
    lineHeight: 26,
  },
  nameInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: fonts.sans,
    color: colors.textPrimary,
  },
  editNotice: {
    fontSize: 12,
    fontFamily: fonts.sans,
    color: colors.textMuted,
    marginBottom: 12,
    lineHeight: 18,
  },
  urlInput: {
    height: 44,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: fonts.sans,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  sectionGap: {
    marginBottom: 8,
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  yearLabel: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.textMuted,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    marginTop: 8,
  },
  toggleCopy: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 14,
    fontFamily: fonts.sans,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  toggleHint: {
    fontSize: 11,
    fontFamily: fonts.sans,
    color: colors.textMuted,
    marginTop: 2,
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: layout.borderWidth,
    borderTopColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.textPrimary,
    borderRadius: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveDisabled: {
    opacity: 0.5,
  },
  saveText: {
    color: colors.surface,
    fontSize: 15,
    fontFamily: fonts.sans,
    fontWeight: '500',
  },
});
