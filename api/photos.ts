import { Platform } from 'react-native';
import { apiClient, unwrapResponse } from '@/api/client';
import type { ApiResponse, ImageUploadResult } from '@/types';

type ImageKind = 'parents' | 'memories';

function guessMimeAndName(localUri: string): { mimeType: string; fileName: string } {
  const rawName = localUri.split('/').pop()?.split('?')[0] || `photo_${Date.now()}.jpg`;
  const ext = rawName.includes('.')
    ? rawName.split('.').pop()!.toLowerCase()
    : 'jpg';
  const mimeType =
    ext === 'png'
      ? 'image/png'
      : ext === 'webp'
        ? 'image/webp'
        : ext === 'gif'
          ? 'image/gif'
          : 'image/jpeg';
  const fileName = rawName.includes('.') ? rawName : `photo.${ext === 'jpeg' ? 'jpg' : ext}`;
  return { mimeType, fileName };
}

async function buildImageFormData(localUri: string): Promise<FormData> {
  const formData = new FormData();
  const { mimeType, fileName } = guessMimeAndName(localUri);

  if (Platform.OS === 'web') {
    const response = await fetch(localUri);
    const blob = await response.blob();
    formData.append('file', blob, fileName);
  } else {
    formData.append('file', {
      uri: localUri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob);
  }

  return formData;
}

/**
 * multipart 업로드 → 서버가 S3에 저장 후
 * { key: DB 저장용, url: 즉시 표시용 Presigned GET } 반환
 */
async function uploadImage(kind: ImageKind, localUri: string): Promise<ImageUploadResult> {
  const formData = await buildImageFormData(localUri);
  const response = await apiClient.post<ApiResponse<ImageUploadResult>>(
    `/images/${kind}`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60_000,
    },
  );
  return unwrapResponse(response);
}

/** POST /images/parents */
export async function uploadParentImage(localUri: string): Promise<ImageUploadResult> {
  return uploadImage('parents', localUri);
}

/** POST /images/memories */
export async function uploadMemoryImage(localUri: string): Promise<ImageUploadResult> {
  return uploadImage('memories', localUri);
}
