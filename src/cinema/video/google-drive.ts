export function parseDriveId(input: string): string {
  let url: URL;
  try { url = new URL(input.trim()); } catch { throw new Error('invalidDrive'); }
  if (url.protocol !== 'https:' || url.hostname !== 'drive.google.com') throw new Error('invalidDrive');
  const id = url.pathname.match(/^\/file\/d\/([\w-]+)(?:\/|$)/)?.[1] ?? (['/open', '/uc'].includes(url.pathname) ? url.searchParams.get('id') : null);
  if (!id || !/^[A-Za-z0-9_-]{10,200}$/.test(id)) throw new Error('invalidDrive');
  return id;
}
