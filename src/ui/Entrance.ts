import { createIcons, ArrowUpRight, Moon, Sun } from 'lucide';
import { getLocale, onLocaleChange, setLocale, t } from '../data/i18n';
import { localize } from './localize';
import './entrance.css';

/** Keep the illustrated threshold light: Three.js only loads after entering the house. */
export function showEntrance(container: HTMLElement) {
  const artwork = document.documentElement.dataset.theme === 'dark'
    ? '/images/entrance-cute-paper-night.jpg' : '/images/entrance-cute-paper.jpg';
  container.innerHTML = `<main class="entrance">
    <header class="entrance-header">
      <a class="entrance-name" href="?page=choose"><span>Sữa Bea</span><span class="entrance-seal" aria-hidden="true">家</span></a>
      <nav class="entrance-languages" aria-label="中文 / Tiếng Việt">
        <button data-locale="vi" lang="vi" aria-label="Tiếng Việt">VI</button><span aria-hidden="true">/</span><button data-locale="zh" lang="zh-CN" aria-label="中文">中文</button>
        <span class="entrance-control-rule" aria-hidden="true"></span>
        <button class="entrance-theme" data-live-copy aria-label="Đổi giao diện sáng / tối"></button>
      </nav>
    </header>
    <section class="entrance-content" aria-labelledby="entrance-title">
      <div class="entrance-hero">
        <h1 id="entrance-title">今天想去哪里？</h1>
        <p class="entrance-intro">一场电影，或一隅宁静？</p>
      </div>
      <div class="destination-doors">
        <a class="destination-door destination-door--cinema" href="?page=cinema" aria-labelledby="cinema-title" aria-describedby="cinema-description">
          <span class="destination-art" aria-hidden="true"><img data-door-art src="${artwork}" width="1586" height="992" alt="" fetchpriority="high" draggable="false" /></span>
          <div class="destination-copy">
            <h2 id="cinema-title"><span>一起看电影</span><span class="destination-arrow"><i data-lucide="arrow-up-right"></i></span></h2>
            <p id="cinema-description">Sữa & Xiiu 的放映室</p>
          </div>
        </a>
        <a class="destination-door destination-door--home" href="?page=home" aria-labelledby="home-title" aria-describedby="home-description">
          <span class="destination-art" aria-hidden="true"><img data-door-art src="${artwork}" width="1586" height="992" alt="" fetchpriority="high" draggable="false" /></span>
          <div class="destination-copy">
            <h2 id="home-title"><span>进屋坐坐</span><span class="destination-arrow"><i data-lucide="arrow-up-right"></i></span></h2>
            <p id="home-description">读书、听雨、坐一会儿</p>
          </div>
        </a>
      </div>
    </section>
    <footer class="entrance-footer"><span class="entrance-footer-rule" aria-hidden="true"></span><p>两个小地方，一段属于我们的时光。</p><span class="entrance-seal" aria-hidden="true">家</span><span class="entrance-footer-rule" aria-hidden="true"></span></footer>
  </main>`;
  const themeButton = container.querySelector<HTMLButtonElement>('.entrance-theme')!;
  const updateTheme = () => {
    const dark = document.documentElement.dataset.theme === 'dark';
    container.querySelectorAll<HTMLImageElement>('[data-door-art]').forEach(image => {
      const source = dark ? '/images/entrance-cute-paper-night.jpg' : '/images/entrance-cute-paper.jpg';
      if (image.getAttribute('src') !== source) image.src = source;
    });
    themeButton.innerHTML = `<i data-lucide="${dark ? 'sun' : 'moon'}"></i>`;
    createIcons({ icons: { ArrowUpRight, Moon, Sun }, attrs: { 'stroke-width': 1.5, 'aria-hidden': 'true' } });
    themeButton.setAttribute('aria-pressed', String(dark));
    themeButton.setAttribute('aria-label', getLocale() === 'vi'
      ? (dark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối')
      : (dark ? '切换浅色模式' : '切换深色模式'));
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
    document.title = `${t('今天想去哪里？')} · Sữa Bea`;
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
