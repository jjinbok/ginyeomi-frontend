import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { showApiErrorAlert } from '@/api/errors';
import { TagChip } from '@/components/TagChip';
import {
  getPreferenceCategoryHint,
  PREFERENCE_CATEGORIES,
} from '@/constants/preferences';
import { colors, fonts, layout } from '@/constants/theme';
import {
  useCreatePreference,
  useDeletePreference,
  useUpdatePreference,
} from '@/hooks/usePreferences';
import type { ParentPreference, PreferenceCategory } from '@/types';

interface PreferenceAddModalProps {
  visible: boolean;
  parentId: number;
  onClose: () => void;
  editingPreference?: ParentPreference | null;
}

export function PreferenceAddModal({
  visible,
  parentId,
  onClose,
  editingPreference,
}: PreferenceAddModalProps) {
  const createMutation = useCreatePreference(parentId);
  const updateMutation = useUpdatePreference(parentId);
  const deleteMutation = useDeletePreference(parentId);
  const isEditMode = !!editingPreference;

  const [category, setCategory] = useState<PreferenceCategory>('FOOD');
  const [content, setContent] = useState('');

  const resetForm = useCallback(() => {
    setCategory('FOOD');
    setContent('');
  }, []);

  useEffect(() => {
    if (!visible) return;

    if (editingPreference) {
      setCategory(editingPreference.category);
      setContent(editingPreference.content);
    } else {
      resetForm();
    }
  }, [visible, editingPreference, resetForm]);

  const isPending =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  const canSave = content.trim().length > 0 && !isPending;

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const handleSave = async () => {
    if (!canSave) return;

    const payload = {
      category,
      content: content.trim(),
    };

    try {
      if (isEditMode && editingPreference) {
        await updateMutation.mutateAsync({
          preferenceId: editingPreference.id,
          payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
        resetForm();
      }
      onClose();
    } catch (error) {
      showApiErrorAlert('저장 실패', error, '기록을 남기지 못했어요.');
    }
  };

  const handleDelete = async () => {
    if (!editingPreference || isPending) return;

    try {
      await deleteMutation.mutateAsync(editingPreference.id);
      onClose();
    } catch (error) {
      showApiErrorAlert('삭제 실패', error, '기록을 지우지 못했어요.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.title}>{isEditMode ? '기록 고치기' : '작은 기록 남기기'}</Text>
          <Text style={styles.subtitle}>
            나중에 책으로 엮을 때, 더 따뜻하게 떠오를 거예요
          </Text>

          <View style={styles.body}>
            <Text style={styles.fieldLabel}>어떤 이야기인가요</Text>
            <View style={styles.chips}>
              {PREFERENCE_CATEGORIES.map((item) => (
                <TagChip
                  key={item.id}
                  label={`${item.emoji} ${item.label}`}
                  selected={category === item.id}
                  onPress={() => setCategory(item.id)}
                />
              ))}
            </View>

            <Text style={styles.fieldLabel}>마음속 한 줄</Text>
            <TextInput
              style={styles.input}
              value={content}
              onChangeText={setContent}
              placeholder={getPreferenceCategoryHint(category)}
              placeholderTextColor={colors.textHint}
              maxLength={500}
              editable={!isPending}
              multiline
            />
          </View>

          <View style={styles.footer}>
            {isEditMode && (
              <Pressable
                style={styles.deleteButton}
                onPress={handleDelete}
                disabled={isPending}
              >
                {deleteMutation.isPending ? (
                  <ActivityIndicator color={colors.accent} />
                ) : (
                  <Text style={styles.deleteText}>지우기</Text>
                )}
              </Pressable>
            )}
            <Pressable
              style={[styles.saveButton, !canSave && styles.saveDisabled]}
              onPress={handleSave}
              disabled={!canSave}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.saveText}>{isEditMode ? '저장하기' : '남겨두기'}</Text>
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
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 20,
  },
  body: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: fonts.serif,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 22,
  },
  input: {
    minHeight: 104,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    borderRadius: layout.cardRadius,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
  },
  deleteButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 14,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: 15,
    fontFamily: fonts.sans,
    color: colors.textMuted,
    fontWeight: '500',
  },
  saveButton: {
    flex: 2,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveDisabled: {
    opacity: 0.4,
  },
  saveText: {
    fontSize: 15,
    fontFamily: fonts.sans,
    color: colors.surface,
    fontWeight: '500',
  },
});
