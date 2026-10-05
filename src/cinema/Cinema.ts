import { createIcons, ArrowUpRight, ArrowUp, ArrowLeft, Play, RotateCcw, RotateCw, Volume2, Maximize, MessageCircle, X, Moon, Sun } from 'lucide';
import { getLocale, onLocaleChange, setLocale } from '../data/i18n';
import { c, errorCopy, localizeCinema } from './copy';
import { cinemaUrl } from './routes';
import { configured } from './supabase/client';
import { enterSharedRoom, loadRoom, roomSource, movies, selectMovie, type Movie, type Room, type Member } from './room/repository';
import type { VideoSource } from './video/providers';
import { VideoPlayer } from './components/VideoPlayer';
import { ChatPanel } from './components/ChatPanel';
import { RoomRealtime, reactions } from './room/realtime';
import './styles.css';
function esc(value: string) { return value.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!); }
function icons() { createIcons({ icons: { ArrowUpRight, ArrowUp, ArrowLeft, Play, RotateCcw, RotateCw, Volume2, Maximize, MessageCircle, X, Moon, Sun }, attrs: { 'stroke-width': 1.5, 'aria-hidden': 'true' } }); }
export function showCinema(container: HTMLElement) {
  const app = new Cinema(container); void app.start(); return () => app.destroy();
}
class Cinema {
  private root: HTMLElement;
  private content: HTMLElement;
  private abort = new AbortController();
  private unsubscribe: () => void;
  private disposed = false;
  private player?: VideoPlayer;
  private chat?: ChatPanel;
  private realtime?: RoomRealtime;
  private members: Member[] = [];
  private movies: Movie[] = [];
  private screenAbort = new AbortController();
  private room?: Room;
  private membershipTimer?: ReturnType<typeof setInterval>;
  constructor(private container: HTMLElement) {
    container.innerHTML = `<main class="mc"><header class="mc-header"><a class="mc-brand" href="${cinemaUrl()}"><span class="mc-seal" aria-hidden="true">影</span><span>MILK CINEMA<small>Sữa Bea · <span data-copy="watch">${c('watch')}</span></small></span></a><nav aria-label="Cinema"><a class="mc-back-home" href="?page=choose"><i data-lucide="arrow-left"></i><span data-copy="home">${c('home')}</span></a><button data-locale="vi">VI</button><button data-locale="zh">中文</button><button data-theme aria-label="Giao diện sáng / tối"><i data-lucide="moon"></i></button></nav></header><div class="mc-content"></div><footer class="mc-footer"><a href="?page=choose" data-copy="home">${c('home')}</a><span data-copy="tagline">${c('tagline')}</span><span>PRIVATE CINEMA · FOR TWO</span></footer></main>`;
    this.root = container.querySelector('.mc')!; this.content = container.querySelector('.mc-content')!;
    container.querySelectorAll<HTMLButtonElement>('[data-locale]').forEach(button => button.addEventListener('click', () => setLocale(button.dataset.locale === 'zh' ? 'zh' : 'vi'), { signal: this.abort.signal }));
    container.querySelector('[data-theme]')!.addEventListener('click', () => {
      const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = theme;
      try { localStorage.setItem('sua-ui-theme',theme); } catch { /* Theme works in memory. */ }
      this.refreshTheme();
    }, { signal: this.abort.signal });
    const preference = matchMedia('(prefers-color-scheme: dark)');
    preference.addEventListener('change', () => {
      let saved = null; try { saved = localStorage.getItem('sua-ui-theme'); } catch { /* Use system. */ }
      if (!saved) document.documentElement.dataset.theme = preference.matches ? 'dark' : 'light'; this.refreshTheme();
    }, { signal: this.abort.signal });
    this.unsubscribe = onLocaleChange(() => this.localize());
    window.addEventListener('pagehide', () => this.destroy(), { signal: this.abort.signal });
    this.localize(); this.refreshTheme();
  }
  private localize() {
    localizeCinema(this.root); document.documentElement.lang = getLocale() === 'vi' ? 'vi' : 'zh-CN'; document.title = 'Milk Cinema · Sữa Bea';
    this.root.querySelectorAll<HTMLElement>('[data-locale]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.locale === getLocale())));
    this.refreshTheme();
  }
  private refreshTheme() {
    const button = this.root.querySelector<HTMLButtonElement>('[data-theme]')!;
    const dark = document.documentElement.dataset.theme === 'dark'; button.setAttribute('aria-pressed', String(dark));
    button.setAttribute('aria-label', getLocale() === 'vi' ? 'Giao diện tối' : '深色模式');
    button.innerHTML = `<i data-lucide="${dark ? 'sun' : 'moon'}"></i>`; icons();
  }
  async start() { this.entry(); }
  private entry(message = '') {
    this.screenAbort.abort(); this.screenAbort = new AbortController();
    this.root.classList.remove('mc-room-page');
    this.content.innerHTML = `<section class="mc-form-layout mc-simple-entry"><div class="mc-form-intro"><p class="mc-eyebrow">MILK CINEMA · FOR TWO</p><h1 data-copy-html="hero">${c('hero')}</h1><p class="mc-lede" data-copy="simpleIntro">${c('simpleIntro')}</p><div class="mc-art" aria-hidden="true"><div class="mc-moon"></div><div class="mc-mountain mc-mountain-far"></div><div class="mc-mountain mc-mountain-near"></div><div class="mc-water"></div><span class="mc-art-glyph">影</span></div></div><form class="mc-form"><fieldset><legend data-copy="choosePerson">${c('choosePerson')}</legend><div class="mc-person-options"><label><input type="radio" name="person" value="Sữa" required><span>Sữa</span></label><label><input type="radio" name="person" value="Xiiu" required><span>Xiiu</span></label></div></fieldset><label for="cinema-pin" data-copy="sharedCode">${c('sharedCode')}</label><input id="cinema-pin" name="pin" type="password" inputmode="numeric" pattern="[0-9]{6}" minlength="6" maxlength="6" autocomplete="off" required aria-describedby="cinema-pin-hint"><p id="cinema-pin-hint" class="mc-field-hint" data-copy="sharedHint">${c('sharedHint')}</p>${this.setupNotice()}<p class="mc-form-error" role="alert">${esc(message)}</p><button type="submit" class="mc-primary" ${configured ? '' : 'disabled'}>${c('enter')}<span><i data-lucide="arrow-up-right"></i></span></button></form></section>`;
    const form = this.content.querySelector('form')!;
    let savedPerson: string | null = null; try { savedPerson = localStorage.getItem('milk-cinema.person'); } catch { /* Optional preference. */ }
    form.querySelectorAll<HTMLInputElement>('[name=person]').forEach(input => { input.checked = input.value === savedPerson; });
    form.addEventListener('submit', async event => {
      event.preventDefault(); if (!configured) return;
      const button = form.querySelector<HTMLButtonElement>('[type=submit]')!;
      const error = form.querySelector<HTMLElement>('.mc-form-error')!;
      const data = new FormData(form); const person = String(data.get('person'));
      button.disabled = true; button.textContent = c('pending'); error.textContent = '';
      try {
        const result = await enterSharedRoom(String(data.get('pin')), person);
        if (this.disposed) return;
        try { localStorage.setItem('milk-cinema.person', person); } catch { /* Preference is optional. */ }
        history.replaceState(null, '', cinemaUrl());
        await this.watch(result.room, result.members, result.userId);
      } catch (err) { if (!this.disposed) { error.textContent = errorCopy(err); button.disabled = false; button.textContent = c('enter'); } }
    }, { signal: this.screenAbort.signal }); icons();
  }
  private setupNotice() { return configured ? '' : `<p class="mc-setup" role="status">${c('setup')}</p>`; }
  private async watch(room: Room, members: Member[], userId: string) {
    const member = members.find(m => m.user_id === userId); if (!member) { this.entry(c('roomMissing')); return; }
    clearInterval(this.membershipTimer); this.realtime?.destroy(); this.chat?.destroy(); this.player?.destroy();
    this.screenAbort.abort(); this.screenAbort = new AbortController();
    this.room = room; this.members = members;
    this.roomShell(room.name,room,roomSource(room),members,member.id);
    const realtime = new RoomRealtime(room,member,this.player!); this.realtime = realtime;
    realtime.onPresence = (online, ready) => {
      if (this.disposed || this.room !== room) return;
      this.paintMembers(online);
      this.content.querySelector('.mc-room-state')!.textContent = c(realtime.connectionReady ? (ready ? 'synced' : 'waiting') : 'reconnecting');
      void this.refreshRoom(room, online).catch(() => {});
    };
    realtime.onConnection = ready => { if (!this.disposed && this.room === room) this.content.querySelector('.mc-room-state')!.textContent = c(ready ? 'synced' : 'reconnecting'); };
    realtime.onMovie = () => { void this.refreshRoom(room).catch(() => {}); };
    realtime.onChat = () => { if (this.room === room) void this.chat?.refresh(); };
    try { await realtime.connect(); } catch (err) { if (!this.disposed) this.content.querySelector('.mc-room-state')!.textContent = errorCopy(err); }
    if (this.disposed || this.room !== room) { realtime.destroy(); return; }
    void movies().then(list => { if (!this.disposed && this.room === room) { this.movies = list; this.paintMovies(room); } }).catch(err => { if (this.room === room) this.content.querySelector('.mc-movie-error')!.textContent = errorCopy(err); });
    this.membershipTimer = setInterval(() => {
      void this.refreshRoom(room).catch(error => {
        if (this.disposed || this.room !== room || errorCopy(error) !== c('roomMissing')) return;
        clearInterval(this.membershipTimer); realtime.destroy(); this.chat?.destroy(); this.player?.destroy(); this.room = undefined;
        this.entry(c('sessionReplaced'));
      });
    }, 5000);
  }
  private async refreshRoom(current: Room, online?: string[]) {
    const loaded = await loadRoom(current.code);
    if (this.disposed || this.room !== current) return;
    if ((loaded.room.video_revision ?? 0) !== (current.video_revision ?? 0) || loaded.room.video_url !== current.video_url) {
      const draft = this.chat?.el.querySelector<HTMLTextAreaElement>('textarea')?.value ?? '';
      const volume = this.player?.video.volume ?? 1; const muted = this.player?.video.muted ?? false;
      await this.watch(loaded.room, loaded.members, loaded.userId);
      if (this.chat && this.room === loaded.room) {
        this.chat.el.querySelector<HTMLTextAreaElement>('textarea')!.value = draft;
        this.player!.video.volume = volume; this.player!.video.muted = muted;
        this.player!.el.querySelector<HTMLInputElement>('.mc-volume')!.value = String(volume);
      }
      return;
    }
    this.members = loaded.members; this.realtime?.updateRoom(loaded.room);
    if (online) this.paintMembers(online);
  }
  private paintMovies(room: Room) {
    const list = this.content.querySelector('.mc-movie-list'); if (!list) return;
    list.innerHTML = this.movies.map(movie => `<button class="mc-movie" data-movie="${esc(movie.id)}" aria-pressed="${movie.video_url === room.video_url}"><span class="mc-meta">${String(movie.position).padStart(2,'0')}</span><span data-user-content>${esc(movie.title)}</span><span class="mc-movie-state">${movie.video_url === room.video_url ? c('selectedMovie') : c('chooseMovie')}</span></button>`).join('');
    list.querySelectorAll<HTMLButtonElement>('[data-movie]').forEach(button => button.addEventListener('click', async () => {
      if (this.room !== room || button.getAttribute('aria-pressed') === 'true') return;
      const error = this.content.querySelector('.mc-movie-error')!; error.textContent = '';
      list.querySelectorAll<HTMLButtonElement>('button').forEach(b => { b.disabled = true; });
      try { await selectMovie(button.dataset.movie!); await this.refreshRoom(room); }
      catch (err) { if (this.room === room) { error.textContent = errorCopy(err); list.querySelectorAll<HTMLButtonElement>('button').forEach(b => { b.disabled = false; }); } }
    }, { signal: this.screenAbort.signal }));
  }
  private roomShell(name: string, room: Room | null, source: VideoSource, members: Member[], memberId: string) {
    this.root.classList.add('mc-room-page');
    this.content.innerHTML = `<div class="mc-room-heading"><div><a class="mc-text-link" href="${cinemaUrl()}"><i data-lucide="arrow-left"></i>${c('cinema')}</a><h1 data-user-content>${esc(name)}</h1><p class="mc-room-state" role="status">${c(room ? 'reconnecting' : 'previewNotice')}</p></div><div class="mc-room-meta"><span class="mc-meta">SỮA & XIIU · FOR TWO</span><div class="mc-members"></div></div></div><div class="mc-watch-grid"><div class="mc-film-column"><div class="mc-player-slot"></div><div class="mc-below-player"><div class="mc-reactions" role="group" aria-label="${c('reactions')}">${reactions.map(e => `<button aria-label="${e}" data-reaction="${e}">${e}</button>`).join('')}</div><button class="mc-open-chat"><i data-lucide="message-circle"></i>${c('chat')}</button></div><section class="mc-playlist"><h2 data-copy="movieList">${c('movieList')}</h2><p class="mc-field-hint" data-copy="movieHint">${c('movieHint')}</p><div class="mc-movie-list"></div><p class="mc-movie-error" role="alert"></p></section></div><div class="mc-chat-slot"></div></div><dialog class="mc-chat-sheet" aria-label="${c('chat')}"></dialog>`;
    this.player = new VideoPlayer(source); this.content.querySelector('.mc-player-slot')!.append(this.player.el);
    this.chat = new ChatPanel(room?.id ?? null,memberId); this.content.querySelector('.mc-chat-slot')!.append(this.chat.el);
    if (room) this.player.setInteractive(false);
    this.members = members; this.paintMembers([]);
    this.content.querySelectorAll<HTMLButtonElement>('[data-reaction]').forEach(b => b.addEventListener('click', () => {
      if (this.realtime) this.realtime.react(b.dataset.reaction!); else this.player?.reaction(b.dataset.reaction!);
    }, { signal: this.screenAbort.signal }));
    const sheet = this.content.querySelector<HTMLDialogElement>('dialog')!;
    const open = this.content.querySelector<HTMLButtonElement>('.mc-open-chat')!;
    open.addEventListener('click', () => { sheet.append(this.chat!.el); sheet.showModal(); this.chat!.el.querySelector('textarea')!.focus(); }, { signal: this.screenAbort.signal });
    const close = () => sheet.close(); this.chat.el.querySelector('.mc-chat-close')!.addEventListener('click',close,{ signal: this.screenAbort.signal });
    sheet.addEventListener('close', () => { this.content.querySelector('.mc-chat-slot')?.append(this.chat!.el); open.focus(); }, { signal: this.screenAbort.signal });
    sheet.addEventListener('click', e => { if (e.target === sheet) { const r = sheet.getBoundingClientRect(); if (e.clientY < r.top || e.clientX < r.left || e.clientX > r.right) close(); } }, { signal: this.screenAbort.signal });
    icons();
  }
  private paintMembers(online: string[]) {
    const el = this.content.querySelector('.mc-members'); if (!el) return;
    el.innerHTML = this.members.map(m => `<span class="mc-member ${online.includes(m.user_id) ? 'mc-member-online' : ''}"><span class="mc-avatar" aria-hidden="true">${esc([...m.display_name][0] || '?')}</span><span><strong data-user-content>${esc(m.display_name)}</strong><small>${m.user_id === this.room?.host_id ? `♔ ${c('host')}` : c(online.includes(m.user_id) ? 'online' : 'offline')}</small></span></span>`).join('');
  }
  destroy() {
    if (this.disposed) return; this.disposed = true;
    clearInterval(this.membershipTimer); this.screenAbort.abort(); this.abort.abort(); this.unsubscribe(); this.realtime?.destroy(); this.chat?.destroy(); this.player?.destroy(); this.container.replaceChildren();
  }
}
