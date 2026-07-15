import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { uploadPhoto } from '@/api/photos';
import { showApiErrorAlert } from '@/api/errors';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { MemoryCard } from '@/components/MemoryCard';
import { MemoryPhotos } from '@/components/MemoryPhotos';
import { TagChip } from '@/components/TagChip';
import { YearPicker } from '@/components/YearPicker';
import { ACTIVITY_TAGS } from '@/constants/tags';
import { colors, fonts, layout, typography } from '@/constants/theme';
import {
  useCreateMemory,
  useDeleteMemory,
  useMemories,
  useUpdateMemory,
} from '@/hooks/useMemories';
import type { Memory, MemoryTag } from '@/types';

const MEMO_MAX_LENGTH = 500;
const MAX_PHOTOS = 3;

export default function MemoryEditScreen() {
  const router = useRouter();
  const { height: windowHeight } = useWindowDimensions();
  const formMinHeight = Math.round(windowHeight * 0.7);
  const params = useLocalSearchParams<{
    anniversaryId: string;
    anniversaryName: string;
    emoji: string;
    recordId?: string;
  }>();

  const anniversaryId = Number(params.anniversaryId);
  const memoryId = params.recordId ? Number(params.recordId) : undefined;
  const isEditMode = memoryId !== undefined;

  const { data: memories = [] } = useMemories(anniversaryId);
  const existingMemory = memories.find((m) => m.id === memoryId);

  const createMutation = useCreateMemory(anniversaryId);
  const updateMutation = useUpdateMemory(anniversaryId);
  const deleteMutation = useDeleteMemory(anniversaryId);

  const [year, setYear] = useState(new Date().getFullYear());
  const [memo, setMemo] = useState('');
  const [selectedTags, setSelectedTags] = useState<MemoryTag[]>([]);
  const [giftInput, setGiftInput] = useState('');
  const [gifts, setGifts] = useState<string[]>([]);
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [localPhotos, setLocalPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [savedMemory, setSavedMemory] = useState<Memory | null>(null);
  const [showComplete, setShowComplete] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  useEffect(() => {
    if (existingMemory) {
      setYear(existingMemory.year);
      setMemo(existingMemory.memo);
      setSelectedTags(existingMemory.tags);
      if (existingMemory.gift) {
        setGifts(existingMemory.gift.split(',').map((g) => g.trim()).filter(Boolean));
      }
      setPhotoUris(existingMemory.photoUrls ?? []);
    }
  }, [existingMemory]);

  const isValidYear = year >= 1900 && year <= new Date().getFullYear() + 1;

  const toggleTag = useCallback((tagId: MemoryTag) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId],
    );
  }, []);

  const addGift = useCallback(() => {
    const trimmed = giftInput.trim();
    if (trimmed && !gifts.includes(trimmed)) {
      setGifts((prev) => [...prev, trimmed]);
      setGiftInput('');
    }
  }, [giftInput, gifts]);

  const pickImage = useCallback(async (index: number) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('권한 필요', '사진을 선택하려면 갤러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setLocalPhotos((prev) => {
        const next = [...prev];
        next[index] = uri;
        return next;
      });
    }
  }, []);

  const handleSave = async () => {
    const giftString = gifts.join(', ');
    const trimmedMemo = memo.trim();
    if (!trimmedMemo) {
      Alert.alert('메모 필요', '이날의 기억을 간단히라도 남겨주세요.');
      return;
    }

    if (!isEditMode && !isValidYear) {
      Alert.alert('년도 확인', '올바른 년도를 선택해주세요.');
      return;
    }

    if (!isEditMode) {
      const duplicated = memories.some((m) => m.year === year);
      if (duplicated) {
        Alert.alert('이미 있는 해', `${year}년 추억이 이미 있어요. 수정을 이용해주세요.`);
        return;
      }
    }

    try {
      let memory: Memory;

      if (isEditMode && memoryId) {
        memory = await updateMutation.mutateAsync({
          memoryId,
          payload: {
            memo: trimmedMemo,
            tags: selectedTags,
            gift: giftString,
          },
        });
      } else {
        memory = await createMutation.mutateAsync({
          year,
          memo: trimmedMemo,
          tags: selectedTags,
          gift: giftString,
        });
      }

      const pendingPhotos = localPhotos.filter(Boolean);
      if (pendingPhotos.length > 0) {
        setIsUploading(true);
        const uploadedUrls: string[] = [...photoUris];
        for (const localUri of pendingPhotos) {
          try {
            const url = await uploadPhoto(memory.id, localUri);
            uploadedUrls.push(url);
          } catch {
            if (__DEV__) {
              uploadedUrls.push(localUri);
            }
          }
        }
        memory = { ...memory, photoUrls: uploadedUrls.slice(0, MAX_PHOTOS) };
        setIsUploading(false);
      }

      setSavedMemory(memory);
      setShowComplete(true);
    } catch (error) {
      showApiErrorAlert('저장 실패', error, '기록을 저장하지 못했습니다. 다시 시도해주세요.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!memoryId) return;
    try {
      await deleteMutation.mutateAsync(memoryId);
      setDeleteVisible(false);
      router.back();
    } catch (error) {
      setDeleteVisible(false);
      showApiErrorAlert('삭제 실패', error, '추억을 삭제하지 못했습니다. 다시 시도해주세요.');
    }
  };

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    isUploading;

  if (showComplete && savedMemory) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completeContent}>
          <Text style={styles.completeIcon}>✦</Text>
          <Text style={styles.completeTitle}>기억이 담겼어요</Text>
          <View style={styles.previewCard}>
            <MemoryCard memory={savedMemory} />
          </View>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => {
              setShowComplete(false);
              router.setParams({ recordId: String(savedMemory.id) });
            }}
          >
            <Text style={styles.secondaryButtonText}>기록 수정하기</Text>
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={() => router.back()}>
            <Text style={styles.primaryButtonText}>확인</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const displayPhotos = Array.from({ length: MAX_PHOTOS }, (_, i) =>
    localPhotos[i] || photoUris[i],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} disabled={isSaving} hitSlop={8}>
          <Text style={styles.cancelText}>취소</Text>
        </Pressable>
        <Text style={styles.headerTitle}>기억 남기기</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.body, { minHeight: formMinHeight }]}>
          <View style={styles.contextChip}>
            <Text style={styles.contextText}>
              {params.emoji} {params.anniversaryName}
            </Text>
          </View>

          <View style={styles.yearRow}>
            <Text style={[typography.sectionLabel, styles.yearLabel]}>년도</Text>
            {isEditMode ? (
              <Text style={styles.yearBadge}>{year}년</Text>
            ) : (
              <YearPicker value={year} onChange={setYear} compact />
            )}
          </View>

          <Text style={[typography.sectionLabel, styles.sectionLabel]}>사진</Text>
          <MemoryPhotos
            photoUrls={displayPhotos}
            editable
            onPickPhoto={pickImage}
          />

          <Text style={[typography.sectionLabel, styles.sectionLabel]}>메모</Text>
          <View style={styles.memoContainer}>
            <TextInput
              style={styles.memoInput}
              value={memo}
              onChangeText={setMemo}
              placeholder="이날의 기억을 남겨두세요..."
              placeholderTextColor={colors.textHint}
              multiline
              maxLength={MEMO_MAX_LENGTH}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>
              {memo.length}/{MEMO_MAX_LENGTH}
            </Text>
          </View>

          <Text style={[typography.sectionLabel, styles.sectionLabel]}>어떤 날이었나요</Text>
          <View style={styles.tagRow}>
            {ACTIVITY_TAGS.map((tag) => (
              <TagChip
                key={tag.id}
                label={`${tag.emoji} ${tag.label}`}
                selected={selectedTags.includes(tag.id)}
                onPress={() => toggleTag(tag.id)}
              />
            ))}
          </View>

          <Text style={[typography.sectionLabel, styles.sectionLabel]}>선물 (선택)</Text>
          <View style={styles.giftRow}>
            <TextInput
              style={styles.giftInput}
              value={giftInput}
              onChangeText={setGiftInput}
              placeholder="선물 이름 입력 후 Enter"
              placeholderTextColor={colors.textHint}
              onSubmitEditing={addGift}
              returnKeyType="done"
            />
            <Pressable style={styles.giftAddButton} onPress={addGift}>
              <Text style={styles.giftAddText}>추가</Text>
            </Pressable>
          </View>
          {gifts.length > 0 && (
            <View style={styles.giftChips}>
              {gifts.map((gift) => (
                <TagChip
                  key={gift}
                  label={gift}
                  onRemove={() => setGifts((prev) => prev.filter((g) => g !== gift))}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Pressable
            style={[styles.saveButton, isSaving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.saveButtonText}>저장하기</Text>
            )}
          </Pressable>
          {isEditMode && (
            <Pressable
              style={[styles.deleteLink, isSaving && styles.buttonDisabled]}
              onPress={() => setDeleteVisible(true)}
              disabled={isSaving}
            >
              <Text style={styles.deleteLinkText}>이 추억 삭제하기</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>

      <ConfirmDialog
        visible={deleteVisible}
        title="추억 삭제"
        message={`${existingMemory?.year ?? year}년 추억을 삭제할까요?`}
        confirmLabel="삭제"
        destructive
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteVisible(false)}
        onConfirm={handleDeleteConfirm}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: layout.borderWidth,
    borderBottomColor: colors.border,
  },
  cancelText: {
    fontSize: 15,
    color: colors.textMuted,
    fontFamily: fonts.sans,
    minWidth: 40,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
  },
  headerSpacer: {
    minWidth: 40,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  contextChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.chipBackground,
    borderRadius: layout.chipRadius,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 20,
  },
  contextText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: fonts.sans,
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  yearLabel: {
    marginBottom: 0,
  },
  yearBadge: {
    fontSize: 14,
    fontFamily: fonts.sans,
    color: colors.textSecondary,
    backgroundColor: colors.chipBackground,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  sectionLabel: {
    marginBottom: 10,
  },
  memoContainer: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    marginBottom: 20,
    minHeight: 110,
  },
  memoInput: {
    ...typography.memo,
    padding: 14,
    minHeight: 90,
    lineHeight: 22,
  },
  charCount: {
    fontSize: 11,
    color: colors.textHint,
    textAlign: 'right',
    paddingRight: 12,
    paddingBottom: 8,
    fontFamily: fonts.sans,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  giftRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  giftInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    padding: 14,
    fontSize: 14,
    fontFamily: fonts.sans,
    color: colors.textPrimary,
  },
  giftAddButton: {
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.tagBackground,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftAddText: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  giftChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
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
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontFamily: fonts.sans,
    fontWeight: '500',
  },
  deleteLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  deleteLinkText: {
    fontSize: 14,
    color: colors.accent,
    fontFamily: fonts.sans,
    fontWeight: '500',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: colors.textPrimary,
    borderRadius: layout.cardRadius,
    minHeight: 52,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontFamily: fonts.sans,
    fontWeight: '500',
    textAlign: 'center',
  },
  completeContent: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeIcon: {
    fontSize: 28,
    color: colors.accent,
    marginBottom: 12,
  },
  completeTitle: {
    fontSize: 22,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
  },
  previewCard: {
    width: '100%',
    marginBottom: 24,
  },
  secondaryButton: {
    width: '100%',
    minHeight: 48,
    borderRadius: 12,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    fontSize: 15,
    color: colors.accent,
    fontFamily: fonts.sans,
    fontWeight: '500',
    textAlign: 'center',
  },
});
