import { getLocale } from '../data/i18n';
const copy = {
  movieList: ['Chọn phim', '选择影片'], movieHint: ['Đổi phim cho cả hai bạn · phim mới bắt đầu từ đầu.', '为两个人切换影片，新影片从头开始。'],
  selectedMovie: ['Đang chọn', '已选择'], chooseMovie: ['Xem phim này', '观看此片'], invalidMovie: ['Không tìm thấy phim này.', '未找到此影片。'],
  simpleIntro: ['Một phòng phim của Sữa và Xiiu. Chọn tên của bạn, nhập mã rồi cùng xem.', 'Sữa 和 Xiiu 的放映室。选择名字，输入代码，一起看电影。'],
  choosePerson: ['Bạn là ai?', '你是谁？'], sharedCode: ['Mã vào phòng', '入场代码'],
  sharedHint: ['Cùng một mã cho cả hai bạn.', '两个人使用同一个代码。'],
  invalidPin: ['Mã vào phòng chưa đúng.', '入场代码不正确。'],
  invalidPerson: ['Hãy chọn Sữa hoặc Xiiu.', '请选择 Sữa 或 Xiiu。'],
  personLocked: ['Trình duyệt này đã vào bằng tên còn lại. Hãy dùng đúng tên hoặc mở trình duyệt riêng.', '此浏览器已使用另一个名字。请选择原来的名字或使用另一个浏览器。'],
  sessionReplaced: ['Tên của bạn vừa đăng nhập ở trình duyệt khác. Nhập mã để vào lại trên máy này.', '你的名字刚在另一浏览器登录。输入代码即可在这里重新进入。'],
  noteInvite: ['Một lời mời', '一份邀请'], noteInviteHint: ['Phòng riêng, chỉ hai người.', '私密房间，仅供两人。'],
  noteSync: ['Cùng một nhịp phim', '同一个节奏'], noteSyncHint: ['Phát, dừng và tua cùng nhau.', '一起播放、暂停和跳转。'],
  noteChat: ['Những lời thì thầm', '轻声分享'], noteChatHint: ['Trò chuyện và gửi cảm xúc.', '聊天与分享心情。'],
  watch: ['Cùng xem, cùng nhớ.', '一起看，一起记住。'],
  eyebrow: ['Milk Cinema · Cho hai người', 'Milk Cinema · 双人放映'], privateCinema: ['Phòng chiếu riêng · Cho hai người', '私人放映 · 仅限两人'],
  roomMeta: ['Sữa & Xiiu · Cho hai người', 'Sữa & Xiiu · 双人放映'],
  pinFormat: ['Mã vào phòng gồm 6 chữ số.', '入场代码为 6 位数字。'], pinPlaceholder: ['6 chữ số', '6 位数字'],
  home: ['Về trang chủ', '返回首页'], cinema: ['Về rạp phim', '返回影院'],
  hero: ['Phim hay hơn<br>khi có người<br><em>cùng xem.</em>', '有你一起，<br>电影变得<br><em>更动人。</em>'],
  intro: ['Một không gian riêng, dành cho những khoảnh khắc thật đặc biệt.', '一处私密空间，留给特别的时刻。'],
  create: ['Tạo phòng xem', '创建放映室'], join: ['Tham gia phòng', '加入放映室'],
  tagline: ['Hai người. Một bộ phim. Một chút thời gian cho nhau.', '两个人，一部电影，一段属于彼此的时光。'],
  chapter: ['BUỔI CHIẾU RIÊNG', '私人放映'], source: ['Nguồn phim', '影片来源'],
  createTitle: ['Chuẩn bị một<br><em>đêm phim.</em>', '准备一场<br><em>电影之夜。</em>'],
  createIntro: ['Chọn một bộ phim, đặt tên cho buổi hẹn. Người còn lại chỉ cần một lời mời.', '选一部影片，为相聚起个名字。另一位只需要一份邀请。'],
  roomName: ['Tên phòng', '放映室名称'], roomPlaceholder: ['Đêm phim của chúng ta ❤️', '我们的电影之夜 ❤️'],
  displayName: ['Tên của bạn', '你的名字'], namePlaceholder: ['Bạn muốn được gọi là gì?', '怎么称呼你？'],
  videoUrl: ['Liên kết video', '视频链接'], urlHint: ['Link phát trực tiếp, không phải trang xem video. MP4 là lựa chọn đơn giản nhất.', '请输入可直接播放的链接，而不是视频网页。MP4 最方便。'],
  driveHint: ['Google Drive có thể chặn phát trực tiếp. File cần cho phép truy cập và tải xuống.', 'Google Drive 可能限制直接播放。文件需要访问和下载权限。'],
  privacy: ['Phòng riêng cho hai người. Liên kết mời là chìa khóa — chỉ chia sẻ với người bạn muốn xem cùng.', '仅供两人的私密放映室。邀请链接就是钥匙，请只分享给同伴。'],
  pending: ['Đang chuẩn bị…', '准备中…'], setup: ['Chưa kết nối Supabase. Cấu hình .env.local và chạy migration để tạo phòng và xem cùng nhau.', '尚未连接 Supabase。请配置 .env.local 并运行迁移以创建放映室。'],
  preview: ['Xem thử video trên máy này', '在本机试播视频'], previewTitle: ['Buổi chiếu thử', '视频试播'],
  previewNotice: ['Chế độ xem thử trên máy này · chưa có phòng hoặc đồng bộ hai người.', '本机试播 · 尚未创建放映室或同步。'],
  ready: ['Phòng của bạn đã sẵn sàng!', '放映室准备好了！'], readyIntro: ['Gửi người ấy một lời mời. Màn chiếu đang chờ hai bạn.', '发出邀请吧，银幕正等着你们。'],
  copy: ['Sao chép liên kết mời', '复制邀请链接'], copied: ['Đã sao chép', '已复制'], enter: ['Vào phòng', '进入放映室'],
  roomCode: ['Mã phòng', '房间代码'], inviteLabel: ['Liên kết mời', '邀请链接'], inviteKey: ['Khóa mời', '邀请密钥'],
  joinTitle: ['Có một chỗ<br><em>dành cho bạn.</em>', '为你留了<br><em>一个位置。</em>'],
  joinIntro: ['Dán liên kết người ấy gửi, hoặc nhập mã phòng và khóa mời.', '粘贴收到的邀请链接，或输入房间代码和邀请密钥。'],
  invalidUrl: ['Hãy nhập liên kết HTTPS hợp lệ tới video. HTTP chỉ hỗ trợ localhost.', '请输入有效的 HTTPS 视频链接。HTTP 仅支持本机地址。'],
  invalidDrive: ['Liên kết Google Drive chưa đúng. Hãy dùng link file/d/…/view hoặc open?id=…', 'Google Drive 链接无效。请使用 file/d/…/view 或 open?id=…'],
  useDrive: ['Hãy chọn tab Google Drive cho liên kết này.', '请为此链接选择 Google Drive 标签。'],
  invalidName: ['Tên phòng tối đa 100 ký tự; tên của bạn tối đa 40 ký tự và không được để trống.', '房间名称最多 100 字，你的名字最多 40 字，均不能为空。'],
  invalidInvite: ['Liên kết mời hoặc khóa mời chưa đúng.', '邀请链接或密钥无效。'],
  roomFull: ['Phòng đã đủ hai người.', '房间已有两位成员。'], roomMissing: ['Không tìm thấy phòng hoặc bạn chưa được mời vào phòng này.', '未找到房间，或你尚未获准加入。'],
  rateLimit: ['Bạn thao tác hơi nhanh. Hãy chờ một chút rồi thử lại.', '操作有些频繁，请稍后重试。'],
  connectionError: ['Không kết nối được. Kiểm tra mạng và cấu hình Supabase rồi thử lại.', '连接失败，请检查网络和 Supabase 配置后重试。'],
  retry: ['Thử lại', '重试'], play: ['Phát', '播放'], pause: ['Tạm dừng', '暂停'], rewind: ['Lùi 10 giây', '后退 10 秒'], forward: ['Tiến 10 giây', '前进 10 秒'],
  mute: ['Tắt/bật tiếng', '静音/取消静音'], volume: ['Âm lượng', '音量'], fullscreen: ['Toàn màn hình', '全屏'], progress: ['Tiến độ phim', '播放进度'],
  loadingVideo: ['Đang mở màn chiếu…', '正在打开银幕…'], buffering: ['Đang tải phim…', '正在缓冲…'],
  driveError: ['Google Drive không cho phép phát trực tiếp file này.', 'Google Drive 不允许直接播放此文件。'],
  videoError: ['Không phát được video này. Kiểm tra liên kết, quyền truy cập hoặc định dạng video.', '无法播放此视频。请检查链接、访问权限或视频格式。'],
  otherSource: ['Thử nguồn khác', '尝试其他来源'], tapPlay: ['Chạm để bắt đầu xem', '点击开始观看'],
  native: ['Dùng trình phát của trình duyệt', '使用浏览器自带播放器'], fullscreenFallback: ['Trình duyệt này chưa hỗ trợ toàn màn hình; hãy dùng điều khiển trình duyệt.', '此浏览器不支持全屏，请使用浏览器控件。'],
  online: ['Đang xem', '在线'], offline: ['Chưa vào phòng', '尚未进入'], host: ['Chủ phòng', '主持人'],
  waiting: ['Đang chờ chủ phòng kết nối lại', '等待主持人重新连接'], reconnecting: ['Đang kết nối lại…', '重新连接中…'], synced: ['Đã kết nối phòng', '房间已连接'],
  chat: ['Trò chuyện', '聊天'], closeChat: ['Đóng trò chuyện', '关闭聊天'], chatPlaceholder: ['Một lời nhắn nhỏ…', '留一句话…'],
  send: ['Gửi tin nhắn', '发送消息'], emptyChat: ['Một câu chuyện trên màn hình.<br>Một cuộc trò chuyện của hai người.', '银幕上是一段故事。<br>这里是属于你们的对话。'],
  chatHint: ['Tin nhắn chỉ dành cho hai bạn.', '消息仅对你们可见。'], previewChat: ['Chat cần một phòng Supabase. Bạn có thể thử nhập, nhưng tin nhắn chưa được gửi.', '聊天需要 Supabase 房间。可以试着输入，但消息不会发送。'],
  failedChat: ['Chưa gửi được. Nội dung được giữ lại; bấm gửi để thử lại.', '发送失败，内容已保留，请点击发送重试。'],
  playlist: ['Trong buổi chiếu này', '本场放映'], activeVideo: ['Phim đang xem', '正在播放的影片'], reactions: ['Gửi cảm xúc', '发送表情'],
  inviteHost: ['Chỉ chủ phòng có thể tạo liên kết mời.', '只有主持人可以生成邀请链接。'],
  restore: ['Đã kết nối lại. Nếu cả hai vừa tải lại trang, hãy chọn lại vị trí phim để tiếp tục.', '已重新连接。如果两人都刷新了页面，请重新选择播放位置。'],
  blank: ['Phòng trống', '空放映室'], joinLoading: ['Đang mở phòng…', '正在打开房间…'],
} as const;
export type CopyKey = keyof typeof copy;
export function c(key: CopyKey): string { return copy[key][getLocale() === 'vi' ? 0 : 1]; }
export function errorCopy(error: unknown): string {
  const message = error instanceof Error ? error.message : typeof error === 'object' && error !== null && 'message' in error ? String(error.message) : '';
  const key = (Object.keys(copy) as CopyKey[]).find(k => message.includes(k));
  return c(key ?? 'connectionError');
}
// Translate existing UI in place: media state, chat history, and form values remain intact.
export function localizeCinema(root: HTMLElement) {
  const index = getLocale() === 'vi' ? 0 : 1;
  root.querySelectorAll<HTMLElement>('[data-copy]').forEach(el => { el.textContent = c(el.dataset.copy as CopyKey); });
  root.querySelectorAll<HTMLElement>('[data-copy-html]').forEach(el => { el.innerHTML = c(el.dataset.copyHtml as CopyKey); });
  root.querySelectorAll<HTMLElement>('h1,.mc-chat-empty').forEach(el => {
    if (el.hasAttribute('data-user-content')) return;
    const pair = Object.values(copy).find(p => p[0] === el.innerHTML || p[1] === el.innerHTML);
    if (pair) el.innerHTML = pair[index];
  });
  const pairs = Object.values(copy).filter(pair => !pair[0].includes('<') && !pair[1].includes('<'));
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.parentElement?.closest('[data-user-content],.mc-message,.mc-chat-input')) continue;
    const text = node.textContent ?? '';
    const exact = pairs.find(p => p[0] === text || p[1] === text);
    if (exact) node.textContent = exact[index];
    else {
      const prefixed = pairs.find(p => text === `二 · ${p[0]}` || text === `二 · ${p[1]}` || text === `♔ ${p[0]}` || text === `♔ ${p[1]}`);
      if (prefixed) node.textContent = `${text.startsWith('二') ? '二 · ' : '♔ '}${prefixed[index]}`;
    }
  }
  root.querySelectorAll<HTMLElement>('[aria-label],[placeholder]').forEach(el => {
    for (const attr of ['aria-label','placeholder']) {
      const value = el.getAttribute(attr); const pair = pairs.find(p => p[0] === value || p[1] === value);
      if (pair) el.setAttribute(attr,pair[index]);
    }
  });
}
