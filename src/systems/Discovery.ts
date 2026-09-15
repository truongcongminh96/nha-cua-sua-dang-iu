export interface DiscoveryDefinition { id: string; label: string; hint: string }
export const discoveries: DiscoveryDefinition[] = [
  { id: 'slow-days', label: '翻开了《慢慢来》', hint: '地毯上，有本书等你翻开' },
  { id: 'little-light', label: '在书桌上找到一点点光', hint: '书桌上的一小束光' },
  { id: 'dear-you', label: '读到了一封写给自己的信', hint: '阅读角的一本小书' },
  { id: 'soft-place', label: '在《安心停靠》里歇了一会儿', hint: '地毯上的柔软停靠' },
  { id: 'small-bravery', label: '收藏了一点小小的勇气', hint: '书架边，藏着小小勇气' },
  { id: 'hidden-note', label: '发现一张留给你的便签', hint: '一张被钉住的小纸条' },
  { id: 'hidden-postcard', label: '收到一张远方的明信片', hint: '远方寄来的温柔' },
  { id: 'hidden-music', label: '打开了那只旧音乐盒', hint: '书架上有一首很轻的小曲' },
  { id: 'camera-memory', label: '把这一刻收进了相机', hint: '桌上的相机还留着回忆' },
  { id: 'pet-window', label: '陪 Mochi 在窗边发了会儿呆', hint: '有时，小家伙也会看风景' },
  { id: 'pet-glide', label: '看见 Mochi 轻轻滑翔', hint: '一场借着风的小小旅行' },
  { id: 'shooting-star', label: '看见夜空悄悄划过一颗星', hint: '夜深了，偶尔看看窗外' },
];
interface SavedDiscoveries { date: string; ids: string[] }
export interface LocalStore { getItem(key: string): string | null; setItem(key: string, value: string): void }
export function localDate(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
export class Discovery {
  private data: SavedDiscoveries;
  persistent = true;
  constructor(private storage: LocalStore | undefined, private changed: (count: number, definition?: DiscoveryDefinition) => void, private today: () => string = localDate) {
    this.data = { date: today(), ids: [] };
    try {
      const raw = storage?.getItem('sua-bea.moments.v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.date === today() && Array.isArray(parsed.ids)) this.data.ids = [...new Set<string>(parsed.ids.filter((id: unknown) => typeof id === 'string' && discoveries.some(d => d.id === id)))];
      }
      this.persistent = !!storage;
    } catch { this.persistent = false; }
    changed(this.data.ids.length);
  }
  private rollover() { if (this.data.date !== this.today()) { this.data = { date: this.today(), ids: [] }; this.changed(0); } }
  has(id: string) { this.rollover(); return this.data.ids.includes(id); }
  get count() { this.rollover(); return this.data.ids.length; }
  record(id: string) {
    this.rollover(); const definition = discoveries.find(d => d.id === id);
    if (!definition || this.data.ids.includes(id)) return false;
    this.data.ids.push(id);
    try { this.storage?.setItem('sua-bea.moments.v1', JSON.stringify(this.data)); } catch { this.persistent = false; }
    this.changed(this.data.ids.length, definition); return true;
  }
}
