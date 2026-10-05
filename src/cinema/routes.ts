export function cinemaUrl(params: Record<string, string> = {}, invite?: string): string {
  const url = new URL(location.href);
  url.search = new URLSearchParams({ page: 'cinema', ...params }).toString();
  url.hash = invite ? new URLSearchParams({ invite }).toString() : '';
  return url.href;
}
export function invitation(value: string): { code: string; secret: string } {
  let url: URL;
  try { url = new URL(value); } catch { throw new Error('invalidInvite'); }
  const code = url.searchParams.get('room')?.toUpperCase() ?? '';
  const secret = new URLSearchParams(url.hash.slice(1)).get('invite') ?? '';
  if (!/^[A-Z2-9]{4,8}$/.test(code) || !/^[a-f0-9]{32,128}$/.test(secret)) throw new Error('invalidInvite');
  return { code, secret };
}
