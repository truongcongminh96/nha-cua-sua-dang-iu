import './ui/styles.css';
import { getLocale, t } from './data/i18n';
import('./app').catch(error => {
  console.error('Unable to open the little house:', error);
  document.documentElement.lang = getLocale() === 'vi' ? 'vi' : 'zh-CN';
  document.querySelector('#app')!.innerHTML = `<div class="loading"><p>${t('小屋暂时没能打开')}</p><small>${t('请使用支持 WebGL 2 的现代浏览器，并开启硬件加速。')}</small><button class="text-button" style="margin-top:24px" onclick="location.reload()">${t('再试一次')}</button></div>`;
});
