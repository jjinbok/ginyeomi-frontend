/**
 * S3 Presigned GET URL에서 object key를 복원합니다.
 * 응답에 key가 없을 때(수정 시 기존 이미지 유지) 사용합니다.
 *
 * - Virtual-hosted: https://{bucket}.s3.{region}.amazonaws.com/{key}?…
 * - Path-style: https://s3.{region}.amazonaws.com/{bucket}/{key}?…
 */
export function extractS3ObjectKey(url: string): string | null {
  try {
    const parsed = new URL(url);
    const path = decodeURIComponent(parsed.pathname.replace(/^\/+/, ''));
    if (!path) return null;

    const host = parsed.hostname.toLowerCase();
    const isPathStyle =
      host === 's3.amazonaws.com' ||
      /^s3[.-][a-z0-9-]+\.amazonaws\.com$/.test(host);

    if (isPathStyle) {
      const slash = path.indexOf('/');
      if (slash === -1) return null;
      const key = path.slice(slash + 1);
      return key || null;
    }

    return path;
  } catch {
    return null;
  }
}
