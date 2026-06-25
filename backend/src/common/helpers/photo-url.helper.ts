export function toPhotoUrl(photo: string | null | undefined, profileCode: string): string | null {
  if (!photo) return null;
  if (photo.startsWith('http')) return photo;
  const hostApi = process.env.HOST_API || 'http://localhost:3000/api/v1';
  return `${hostApi}/profile/photo/${profileCode}`;
}
