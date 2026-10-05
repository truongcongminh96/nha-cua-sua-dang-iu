import { parseDriveId } from './google-drive';
export type VideoSource = { provider: 'direct'; url: string } | { provider: 'google-drive'; fileId: string; originalUrl: string };
export function parseSource(value: string, provider: VideoSource['provider']): VideoSource {
  const input = value.trim();
  let url: URL;
  try { url = new URL(input); } catch { throw new Error('invalidUrl'); }
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))) throw new Error('invalidUrl');
  if (url.username || url.password) throw new Error('invalidUrl');
  if (provider === 'google-drive') return { provider, fileId: parseDriveId(input), originalUrl: input };
  if (url.hostname === 'drive.google.com') throw new Error('useDrive');
  return { provider, url: url.href };
}
export function mediaUrl(source: VideoSource): string {
  return source.provider === 'direct' ? source.url : `https://drive.google.com/uc?export=download&id=${encodeURIComponent(source.fileId)}`;
}
