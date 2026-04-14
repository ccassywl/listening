const CACHE_NAME = 'eng-listen-pwa-v1';

// 當 Service Worker 安裝完成時
self.addEventListener('install', (event) => {
  self.skipWaiting(); // 強制新的 SW 立即接管，不需等待用戶關閉所有分頁
});

// 當新的 Service Worker 啟用時
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim()); // 立即控制所有打開的客戶端，確保更新生效
});

// 當網頁發出請求時 (Network First 策略)
self.addEventListener('fetch', (event) => {
  // 忽略擴充功能等非 HTTP(S) 請求
  if (!(event.request.url.startsWith('http:') || event.request.url.startsWith('https:'))) {
      return; 
  }

  event.respondWith(
    // 1. 永遠優先嘗試從網路上抓取最新的程式碼和資料
    fetch(event.request)
      .then((networkResponse) => {
        // 如果成功抓取最新版本，順便把它存進快取中，留著以後斷網用
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      })
      .catch(() => {
        // 2. 如果斷網或抓取失敗，才拿出上次快取好的檔案
        return caches.match(event.request);
      })
  );
});