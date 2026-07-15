import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { showApiErrorAlert } from '@/api/errors';
import { MonthDayPicker } from '@/components/MonthDayPicker';
import { TagChip } from '@/components/TagChip';
import { EMOJI_OPTIONS } from '@/constants/tags';
import { PARENT_RELATIONS } from '@/constants/parents';
import { colors, fonts, layout, typography } from '@/constants/theme';
import { useCreateAnniversary, useUpdateAnniversary } from '@/hooks/useAnniversaries';
import { useParents } from '@/hooks/useParents';
import type { Anniversary } from '@/types';

interface AnniversaryAddModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (anniversary?: Anniversary) => void;
  editingAnniversary?: Anniversary | null;
}

export function AnniversaryAddModal({
  visible,
  onClose,
  onSuccess,
  editingAnniversary,
}: AnniversaryAddModalProps) {
  const createMutation = useCreateAnniversary();
  const updateMutation = useUpdateAnniversary();
  const { data: parents = [] } = useParents();
  const isEditMode = !!editingAnniversary;

  const [emoji, setEmoji] = useState('🎂');
  const [name, setName] = useState('');
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [recurring, setRecurring] = useState(true);
  const [selectedParentIds, setSelectedParentIds] = useState<number[]>([]);

  const resetForm = useCallback(() => {
    setEmoji('🎂');
    setName('');
    setMonth(1);
    setDay(1);
    setRecurring(true);
    setSelectedParentIds(parents.map((p) => p.id));
  }, [parents]);

  useEffect(() => {
    if (!visible) return;

    if (editingAnniversary) {
      setEmoji(editingAnniversary.emoji);
      setName(editingAnniversary.name);
      setMonth(editingAnniversary.month);
      setDay(editingAnniversary.day);
      setRecurring(editingAnniversary.recurring);
    } else {
      resetForm();
    }
  }, [visible, editingAnniversary, resetForm, parents]);

  const toggleParent = useCallback((parentId: number) => {
    setSelectedParentIds((prev) => {
      if (prev.includes(parentId)) {
        return prev.filter((id) => id !== parentId);
      }
      if (prev.length >= 2) {
        Alert.alert('선택 제한', '부모님은 최대 2명까지 선택할 수 있어요.');
        return prev;
      }
      return [...prev, parentId];
    });
  }, []);

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

    if (!isEditMode && selectedParentIds.length === 0) {
      Alert.alert('부모님 선택', '이 기념일과 연결할 부모님을 선택해주세요.');
      return;
    }

    const payload = {
      name: name.trim(),
      emoji,
      month,
      day,
      recurring,
    };

    try {
      let result: Anniversary;

      if (isEditMode && editingAnniversary) {
        result = await updateMutation.mutateAsync({
          id: editingAnniversary.id,
          payload,
        });
      } else {
        result = await createMutation.mutateAsync({
          ...payload,
          parentIds: selectedParentIds,
        });
        resetForm();
      }

      onSuccess?.(result);
      onClose();
    } catch (error) {
      showApiErrorAlert('저장 실패', error, '기념일을 저장하지 못했습니다.');
    }
  };

  const canSave =
    name.trim().length > 0 && (isEditMode || selectedParentIds.length > 0) && !isPending;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.title}>{isEditMode ? '기념일 수정' : '기념일 추가'}</Text>

          <View style={styles.body}>
            <View style={styles.nameRow}>
              <View style={styles.emojiBadge}>
                <Text style={styles.emojiBadgeText}>{emoji}</Text>
              </View>
              <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                placeholder="기념일 이름"
                placeholderTextColor={colors.textHint}
              />
            </View>

            <View style={styles.emojiGrid}>
              {EMOJI_OPTIONS.map((e) => {
                const selected = emoji === e;
                return (
                  <Pressable
                    key={e}
                    style={[styles.emojiChip, selected && styles.emojiChipSelected]}
                    onPress={() => setEmoji(e)}
                  >
                    <Text style={styles.emojiChipText}>{e}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[typography.sectionLabel, styles.sectionGap]}>날짜</Text>
            <MonthDayPicker month={month} day={day} onChange={handleDateChange} />

            {!isEditMode && (
              <>
                <Text style={[typography.sectionLabel, styles.sectionGap]}>연결할 부모님</Text>
                {parents.length === 0 ? (
                  <Text style={styles.parentHint}>먼저 부모님 정보를 등록해주세요.</Text>
                ) : (
                  <View style={styles.parentRow}>
                    {parents.map((parent) => {
                      const info = PARENT_RELATIONS[parent.relation];
                      const selected = selectedParentIds.includes(parent.id);
                      return (
                        <TagChip
                          key={parent.id}
                          label={`${info.emoji} ${parent.name}`}
                          selected={selected}
                          onPress={() => toggleParent(parent.id)}
                        />
                      );
                    })}
                  </View>
                )}
              </>
            )}

            <View style={styles.toggleRow}>
              <View style={styles.toggleCopy}>
                <Text style={styles.toggleLabel}>매년 반복</Text>
                <Text style={styles.toggleHint}>다가오는 기념일에 표시</Text>
              </View>
              <Switch
                value={recurring}
                onValueChange={setRecurring}
                trackColor={{ false: colors.border, true: colors.accent }}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Pressable
              style={[styles.saveButton, !canSave && styles.saveDisabled]}
              onPress={handleSave}
              disabled={!canSave}
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(44, 36, 22, 0.35)',
  },
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
    marginBottom: 10,
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
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  emojiChip: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
  },
  emojiChipSelected: {
    backgroundColor: colors.tagBackground,
    borderColor: colors.textPrimary,
  },
  emojiChipText: {
    fontSize: 18,
    lineHeight: 22,
  },
  sectionGap: {
    marginBottom: 6,
  },
  parentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  parentHint: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.textHint,
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 6,
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
