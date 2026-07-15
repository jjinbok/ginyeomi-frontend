import { File } from 'expo-file-system';
import { apiClient, unwrapResponse } from '@/api/client';
import type { ApiResponse, PhotoConfirmResponse, PresignedUrlResponse } from '@/types';

export async function getPresignedUrl(recordId: number): Promise<PresignedUrlResponse> {
  const response = await apiClient.post<ApiResponse<PresignedUrlResponse>>(
    `/records/${recordId}/photos/presigned-url`,
  );
  return unwrapResponse(response);
}

export async function uploadPhotoToGcs(uploadUrl: string, localUri: string): Promise<void> {
  const extension = localUri.split('.').pop()?.toLowerCase() || 'jpeg';
  const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';

  const file = new File(localUri);
  const uploadResult = await file.upload(uploadUrl, {
    httpMethod: 'PUT',
    mimeType,
    headers: { 'Content-Type': mimeType },
  });

  if (uploadResult.status < 200 || uploadResult.status >= 300) {
    throw new Error('사진 업로드에 실패했습니다.');
  }
}

export async function confirmPhoto(
  recordId: number,
  objectName: string,
): Promise<PhotoConfirmResponse> {
  const response = await apiClient.post<ApiResponse<PhotoConfirmResponse>>(
    `/records/${recordId}/photos/confirm`,
    { objectName },
  );
  return unwrapResponse(response);
}

export async function uploadPhoto(recordId: number, localUri: string): Promise<string> {
  const { uploadUrl, objectName } = await getPresignedUrl(recordId);
  await uploadPhotoToGcs(uploadUrl, localUri);
  const { url } = await confirmPhoto(recordId, objectName);
  return url;
}
