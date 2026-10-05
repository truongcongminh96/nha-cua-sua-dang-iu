import { c } from '../copy';
import { history, sendMessage, type Message } from '../room/repository';
export class ChatPanel {
  readonly el: HTMLElement;
  private abort = new AbortController();
  private fetching = false;
  private fetchAgain = false;
  private rows = new Map<string, Message>();
  private pending?: { id: string; content: string };
  private disposed = false;
  onMessage: () => void = () => {};
  constructor(private roomId: string | null, private memberId: string) {
    this.el = document.createElement('section'); this.el.className = 'mc-chat'; this.el.setAttribute('aria-label', c('chat'));
    this.el.innerHTML = `<header><div><span class="mc-meta">二 · ${c('chat')}</span><h2>${c('chat')}</h2></div><button class="mc-chat-close" aria-label="${c('closeChat')}">×</button></header><div class="mc-messages" role="log" aria-live="polite" aria-relevant="additions"><p class="mc-chat-empty">${c('emptyChat')}</p></div><form class="mc-chat-form"><label class="mc-sr" for="mc-chat-input">${c('chat')}</label><textarea id="mc-chat-input" rows="1" maxlength="1000" placeholder="${c('chatPlaceholder')}" required></textarea><button type="submit" aria-label="${c('send')}" ${roomId ? '' : 'disabled'}><i data-lucide="arrow-up"></i></button></form><p class="mc-chat-note">${c(roomId ? 'chatHint' : 'previewChat')}</p><p class="mc-chat-error" role="status"></p>`;
    this.el.querySelector('form')!.addEventListener('submit', e => { e.preventDefault(); void this.submit(); }, { signal: this.abort.signal });
    this.el.querySelector('textarea')!.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); void this.submit(); } }, { signal: this.abort.signal });
  }
  async refresh() {
    if (!this.roomId || this.disposed) return;
    if (this.fetching) { this.fetchAgain = true; return; }
    this.fetching = true;
    try {
      const messages = await history(this.roomId);
      if (this.disposed) return;
      for (const m of messages) this.rows.set(m.id, m);
      this.paint(); this.el.querySelector('.mc-chat-error')!.textContent = '';
    } catch { if (!this.disposed) this.el.querySelector('.mc-chat-error')!.textContent = c('connectionError'); }
    finally { this.fetching = false; if (this.fetchAgain) { this.fetchAgain = false; void this.refresh(); } }
  }
  private paint(forceScroll = false) {
    const list = this.el.querySelector<HTMLElement>('.mc-messages')!;
    const nearBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 70;
    const scroll = list.scrollTop;
    if (!this.rows.size) return;
    list.replaceChildren();
    const sorted = [...this.rows.values()].sort((a,b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id)).slice(-100);
    this.rows = new Map(sorted.map(m => [m.id,m]));
    for (const m of sorted) {
      const item = document.createElement('article'); item.className = `mc-message ${m.member_id === this.memberId ? 'mc-message-own' : ''}`;
      const meta = document.createElement('div'); const name = document.createElement('strong'); name.textContent = m.display_name;
      const time = document.createElement('time'); time.dateTime = m.created_at; time.textContent = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      meta.append(name,time); const content = document.createElement('p'); content.textContent = m.content; item.append(meta,content); list.append(item);
    }
    list.scrollTop = forceScroll || nearBottom ? list.scrollHeight : scroll;
  }
  private sending = false;
  private async submit() {
    if (!this.roomId || this.sending || this.disposed) return;
    const input = this.el.querySelector('textarea')!; const content = input.value.trim();
    if (!content || content.length > 1000) return;
    if (this.pending?.content !== content) this.pending = { id: crypto.randomUUID(), content };
    this.sending = true; const button = this.el.querySelector<HTMLButtonElement>('[type=submit]')!; button.disabled = true;
    try {
      const row = await sendMessage(this.roomId, content, this.pending.id);
      if (this.disposed) return;
      this.rows.set(row.id,row); this.pending = undefined;
      if (input.value.trim() === content) input.value = '';
      this.paint(true); this.el.querySelector('.mc-chat-error')!.textContent = ''; this.onMessage();
    } catch { if (!this.disposed) this.el.querySelector('.mc-chat-error')!.textContent = c('failedChat'); }
    finally { this.sending = false; button.disabled = false; }
  }
  destroy() { this.disposed = true; this.abort.abort(); this.rows.clear(); this.el.remove(); }
}
