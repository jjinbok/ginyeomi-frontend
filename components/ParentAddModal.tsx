import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { showApiErrorAlert, showAppAlert } from '@/api/errors';
import { uploadParentImage } from '@/api/photos';
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
  const [profilePreviewUrl, setProfilePreviewUrl] = useState('');
  /** undefined: 변경 없음 / null: 삭제 / string: 새 업로드 key */
  const [pendingImageKey, setPendingImageKey] = useState<string | null | undefined>(undefined);
  const [localProfileUri, setLocalProfileUri] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const resetForm = useCallback(() => {
    setName('');
    setYear(1960);
    setMonth(1);
    setDay(1);
    setLunarBirth(false);
    setProfilePreviewUrl('');
    setPendingImageKey(undefined);
    setLocalProfileUri(null);
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
      setProfilePreviewUrl(editingParent.profileImageUrl ?? '');
      setPendingImageKey(undefined);
      setLocalProfileUri(null);
    } else {
      resetForm();
    }
  }, [visible, editingParent, resetForm]);

  const isPending = createMutation.isPending || updateMutation.isPending || isUploadingImage;

  const handleDateChange = useCallback((nextMonth: number, nextDay: number) => {
    setMonth(nextMonth);
    setDay(nextDay);
  }, []);

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const pickProfileImage = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAppAlert('권한 필요', '사진을 선택하려면 갤러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets[0]) {
      setLocalProfileUri(result.assets[0].uri);
    }
  }, []);

  const clearProfileImage = useCallback(() => {
    setLocalProfileUri(null);
    setProfilePreviewUrl('');
    setPendingImageKey(null);
  }, []);

  const handleSave = async () => {
    if (!name.trim()) return;

    try {
      let nextKey = pendingImageKey;

      if (localProfileUri) {
        setIsUploadingImage(true);
        try {
          const uploaded = await uploadParentImage(localProfileUri);
          nextKey = uploaded.key;
          setPendingImageKey(uploaded.key);
          setProfilePreviewUrl(uploaded.url);
          setLocalProfileUri(null);
        } finally {
          setIsUploadingImage(false);
        }
      }

      let result: Parent;

      if (isEditMode && editingParent) {
        // 서버는 key만 받음 — 사진 변경/삭제가 없으면 API 생략
        if (nextKey === undefined) {
          onClose();
          return;
        }
        result = await updateMutation.mutateAsync({
          parentId: editingParent.id,
          payload: {
            profileImageKey: nextKey,
          },
        });
      } else {
        result = await createMutation.mutateAsync({
          name: name.trim(),
          relation,
          birthDate: toBirthDate(year, month, day),
          lunarBirth,
          profileImageKey: typeof nextKey === 'string' ? nextKey : null,
        });
        resetForm();
      }

      onSuccess?.(result);
      onClose();
    } catch (error) {
      setIsUploadingImage(false);
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
                이름·생일은 수정할 수 없어요. 프로필 사진만 변경할 수 있습니다.
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

            <Text style={[typography.sectionLabel, styles.sectionGap]}>프로필 사진 (선택)</Text>
            <View style={styles.photoRow}>
              <Pressable
                style={({ pressed }) => [styles.photoPicker, pressed && styles.photoPressed]}
                onPress={pickProfileImage}
                disabled={isPending}
              >
                {localProfileUri || profilePreviewUrl ? (
                  <Image
                    source={{ uri: localProfileUri || profilePreviewUrl }}
                    style={styles.photoPreview}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoPlaceholderMark}>+</Text>
                    <Text style={styles.photoPlaceholderText}>사진 선택</Text>
                  </View>
                )}
              </Pressable>
              {(localProfileUri || profilePreviewUrl) && !isPending ? (
                <Pressable onPress={clearProfileImage} hitSlop={8}>
                  <Text style={styles.photoClear}>사진 지우기</Text>
                </Pressable>
              ) : null}
            </View>
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
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 8,
  },
  photoPicker: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    backgroundColor: colors.tagBackground,
  },
  photoPressed: {
    opacity: 0.88,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  photoPlaceholderMark: {
    fontSize: 20,
    color: colors.accent,
    lineHeight: 24,
  },
  photoPlaceholderText: {
    fontSize: 10,
    fontFamily: fonts.sans,
    color: colors.textMuted,
  },
  photoClear: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.textMuted,
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
