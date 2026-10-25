// 서연이의 레시피노트 — 오프라인 실행용. 앱을 고치면 VERSION 숫자를 올리세요.
const VERSION = 'recipe-note-v16';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {   // 화면: 인터넷 되면 최신, 안 되면 저장본
    e.respondWith(fetch(req).then(res => { const cp = res.clone(); caches.open(VERSION).then(c => c.put('./index.html', cp)); return res; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {   // 아이콘·글꼴: 저장본 우선
    if (res.ok || res.type === 'opaque') { const cp = res.clone(); caches.open(VERSION).then(c => c.put(req, cp)); }
    return res;
  })));
});
