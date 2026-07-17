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
import { PREFERENCE_CATEGORIES } from '@/constants/preferences';
import { colors, fonts, layout, typography } from '@/constants/theme';
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
      showApiErrorAlert('저장 실패', error, '선호도를 저장하지 못했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!editingPreference || isPending) return;

    try {
      await deleteMutation.mutateAsync(editingPreference.id);
      onClose();
    } catch (error) {
      showApiErrorAlert('삭제 실패', error, '선호도를 삭제하지 못했습니다.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.title}>{isEditMode ? '선호도 수정' : '선호도 추가'}</Text>

          <View style={styles.body}>
            <Text style={typography.sectionLabel}>카테고리</Text>
            <View style={styles.chips}>
              {PREFERENCE_CATEGORIES.map((item) => (
                <TagChip
                  key={item.id}
                  label={item.label}
                  selected={category === item.id}
                  onPress={() => setCategory(item.id)}
                />
              ))}
            </View>

            <Text style={[typography.sectionLabel, styles.contentLabel]}>내용</Text>
            <TextInput
              style={styles.input}
              value={content}
              onChangeText={setContent}
              placeholder="예: 갈비 / 주말 산책 해드리기"
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
                  <Text style={styles.deleteText}>삭제</Text>
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
                <Text style={styles.saveText}>{isEditMode ? '저장' : '추가'}</Text>
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
    marginBottom: 20,
  },
  body: {
    marginBottom: 20,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  contentLabel: {
    marginBottom: 10,
  },
  input: {
    minHeight: 88,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    borderRadius: layout.cardRadius,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: fonts.sans,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
  },
  deleteButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: 15,
    fontFamily: fonts.sans,
    color: colors.accent,
    fontWeight: '500',
  },
  saveButton: {
    flex: 2,
    minHeight: 48,
    borderRadius: 12,
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
