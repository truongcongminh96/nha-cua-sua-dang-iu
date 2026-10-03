import { createIcons, ArrowUpRight, ArrowLeft } from 'lucide';
import { getLocale, onLocaleChange, setLocale, t } from '../data/i18n';
import { localize } from './localize';
import './entrance.css';

/** Three.js only loads after choosing the house. */
export function showEntrance(container: HTMLElement, cinema = false) {
  container.innerHTML = `<main class="entrance">
    <header class="entrance-header">
      <a class="entrance-name" href="?page=choose"><span class="entrance-seal" aria-hidden="true">家</span><span>Sữa Bea</span></a>
      <nav class="entrance-languages" aria-label="中文 / Tiếng Việt">
        <button data-locale="zh">中文</button><span aria-hidden="true">/</span><button data-locale="vi">Tiếng Việt</button>
        <button class="entrance-theme" data-live-copy aria-label="Đổi giao diện sáng / tối"></button>
      </nav>
    </header>
    <section class="entrance-content" aria-labelledby="entrance-title">
      <div class="entrance-watermark" aria-hidden="true">${cinema ? '影' : '家'}</div>
      <div class="entrance-hero">
        <p class="entrance-eyebrow">Sữa Bea · <span>来待一会儿吧。</span></p>
        <h1 id="entrance-title">${cinema ? '小影院还在布置中。' : '今天想去哪里？'}</h1>
        <p class="entrance-intro">${cinema ? '电影还没开场。先来小屋坐一会儿吧。' : '看一场电影，或回小屋歇一歇。'}</p>
        <a class="entrance-home-link" href="?page=home"><span>进屋坐坐</span><span class="entrance-arrow"><i data-lucide="arrow-up-right"></i></span></a>
      </div>
      ${cinema ? `<a class="entrance-back" href="?page=choose"><i data-lucide="arrow-left"></i><span>重新选一个地方</span></a>` : `
      <div class="destination-index"><span aria-hidden="true">目錄</span><span>01 — 02</span></div>
      <div class="destination-cards">
        <a class="destination-card" href="?page=cinema">
          <span class="destination-number" aria-hidden="true">一</span>
          <div class="destination-copy"><h2>一起看电影</h2><p>留一点时间，给银幕里的故事。</p></div>
          <span class="destination-note">小影院正在准备中</span><i class="destination-arrow" data-lucide="arrow-up-right"></i>
        </a>
        <a class="destination-card" href="?page=home">
          <span class="destination-number" aria-hidden="true">二</span>
          <div class="destination-copy"><h2>进屋坐坐</h2><p>翻翻书，听听雨，陪 Mochi 待一会儿。</p></div>
          <span class="destination-note">小屋的灯已经亮了</span><i class="destination-arrow" data-lucide="arrow-up-right"></i>
        </a>
      </div>`}
    </section>
    <footer class="entrance-footer"><p>不用赶时间。</p><span>Sữa Bea</span></footer>
  </main>`;
  createIcons({ icons: { ArrowUpRight, ArrowLeft }, attrs: { 'stroke-width': 1.5, 'aria-hidden': 'true' } });
  const themeButton = container.querySelector<HTMLButtonElement>('.entrance-theme')!;
  const updateTheme = () => {
    const dark = document.documentElement.dataset.theme === 'dark';
    themeButton.textContent = dark ? '月' : '日';
    themeButton.setAttribute('aria-pressed', String(dark));
    themeButton.setAttribute('aria-label', getLocale() === 'vi' ? 'Giao diện tối' : '深色模式');
  };
  themeButton.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('sua-ui-theme', next); } catch { /* Theme still works without storage. */ }
    updateTheme();
  });
  const preference = matchMedia('(prefers-color-scheme: dark)');
  preference.addEventListener('change', () => {
    let saved: string | null = null;
    try { saved = localStorage.getItem('sua-ui-theme'); } catch { /* Use system preference. */ }
    if (saved !== 'light' && saved !== 'dark') document.documentElement.dataset.theme = preference.matches ? 'dark' : 'light';
    updateTheme();
  });
  const refresh = () => {
    localize(container);
    document.documentElement.lang = getLocale() === 'vi' ? 'vi' : 'zh-CN';
    document.title = cinema ? `${t('一起看电影')} · Sữa Bea` : `${t('今天想去哪里？')} · Sữa Bea`;
    container.querySelectorAll<HTMLButtonElement>('[data-locale]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.locale === getLocale()));
    });
    updateTheme();
  };
  container.querySelectorAll<HTMLButtonElement>('[data-locale]').forEach(button => {
    button.addEventListener('click', () => setLocale(button.dataset.locale === 'zh' ? 'zh' : 'vi'));
  });
  onLocaleChange(refresh); refresh();
}
