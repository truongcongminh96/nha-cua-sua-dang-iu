export type QuoteCategory = 'calm' | 'tired' | 'courage' | 'loneliness' | 'tomorrow' | 'self-kindness';
export interface QuoteDefinition { id: string; category: QuoteCategory; zh: string; vi: string; en: string }
export const quotes: QuoteDefinition[] = [
  { id: 'enough', vi: 'Hôm nay,\nbạn đã làm tốt lắm rồi.', category: 'self-kindness', zh: '今天，\n已经做得很好了。', en: 'You have done enough for today.' },
  { id: 'slow', vi: 'Chậm một chút,\nvẫn là đang tiến về phía trước.', category: 'calm', zh: '慢一点，\n也是在向前走。', en: 'Slowly is still moving forward.' },
  { id: 'answers', vi: 'Có những chuyện,\nkhông cần hiểu hết hôm nay.', category: 'calm', zh: '有些事情，\n不需要今天想明白。', en: 'Not everything needs an answer today.' },
  { id: 'rest', vi: 'Khi thấy mệt,\nhãy cho mình nghỉ ngơi.', category: 'tired', zh: '累的时候，\n就先好好休息。', en: 'When you are tired, let yourself rest.' },
  { id: 'prove', vi: 'Bạn không cần\nluôn chứng minh bản thân.', category: 'self-kindness', zh: '你不需要\n一直证明自己。', en: 'You do not have to keep proving yourself.' },
  { id: 'begin', vi: 'Một bước nhỏ thôi,\ncũng đáng được chúc mừng.', category: 'courage', zh: '小小的一步，\n也值得被庆祝。', en: 'Even the smallest step is worth celebrating.' },
  { id: 'company', vi: 'Ngọn đèn nhỏ này,\ncũng đang sáng vì bạn.', category: 'loneliness', zh: '这盏小灯，\n也在为你亮着。', en: 'This little light is here for you, too.' },
  { id: 'tomorrow', vi: 'Gió ngày mai\nsẽ mang một câu chuyện mới.', category: 'tomorrow', zh: '明天的风，\n会带来新的故事。', en: 'Tomorrow brings a new story.' },
  { id: 'grow', vi: 'Ngay cả khi chẳng ai thấy,\nbạn vẫn đang lớn lên.', category: 'courage', zh: '不被看见的日子里，\n你也在生长。', en: 'You are growing, even when no one sees.' },
  { id: 'cloud', vi: 'Thỉnh thoảng làm một đám mây,\nchẳng cần vội đi đâu.', category: 'tired', zh: '偶尔做一朵云，\n什么也不用赶。', en: 'Be a cloud for a while. There is no hurry.' },
  { id: 'home', vi: 'Luôn có một góc nhỏ,\ndịu dàng đón lấy bạn.', category: 'loneliness', zh: '总有一个角落，\n温柔地接住你。', en: 'There is a soft place for you to land.' },
  { id: 'light', vi: 'Một chút ánh sáng,\nlà đủ cho bước tiếp theo.', category: 'tomorrow', zh: '一点点光，\n就够照亮下一步。', en: 'A little light is enough for the next step.' },
];
export interface BookDefinition { id: string; title: string; color: string; quotes: string[]; position: [number, number, number]; rotation: number }
export const books: BookDefinition[] = [
  { id: 'slow-days', title: '慢慢来', color: '#53584b', quotes: ['slow', 'answers', 'cloud'], position: [-.72, .28, .7], rotation: -.22 },
  { id: 'little-light', title: '一点点光', color: '#938269', quotes: ['light', 'tomorrow'], position: [1.9, 1.46, -2.45], rotation: .18 },
  { id: 'dear-you', title: '亲爱的你', color: '#777970', quotes: ['enough', 'prove'], position: [-2.42, .98, 1.64], rotation: -.15 },
  { id: 'soft-place', title: '安心停靠', color: '#6d4940', quotes: ['rest', 'home'], position: [.5, .28, 1.4], rotation: .5 },
  { id: 'small-bravery', title: '小小勇气', color: '#756f5e', quotes: ['begin', 'grow'], position: [-2.44, 1.325, -2.48], rotation: .06 },
];
