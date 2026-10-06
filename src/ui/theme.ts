// Site theme shared by the entrance, cinema and house: one storage key, one browser chrome color.
export type Theme = 'light' | 'dark';
const chrome: Record<Theme, string> = { light: '#f6f2e9', dark: '#131010' };

export function currentTheme(): Theme { return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'; }
export function setThemeColor(theme: Theme) { document.querySelector('meta[name=theme-color]')?.setAttribute('content', chrome[theme]); }
export function applyTheme(theme: Theme, persist = true) {
  document.documentElement.dataset.theme = theme;
  setThemeColor(theme);
  if (persist) try { localStorage.setItem('sua-ui-theme', theme); } catch { /* Theme still works for this visit. */ }
}
/** Follow system changes only while the person has not picked a theme themselves. */
export function followSystemTheme(onChange: () => void, signal?: AbortSignal) {
  const preference = matchMedia('(prefers-color-scheme: dark)');
  preference.addEventListener('change', () => {
    let saved: string | null = null;
    try { saved = localStorage.getItem('sua-ui-theme'); } catch { /* Use system preference. */ }
    if (saved !== 'light' && saved !== 'dark') applyTheme(preference.matches ? 'dark' : 'light', false);
    onChange();
  }, { signal });
}
