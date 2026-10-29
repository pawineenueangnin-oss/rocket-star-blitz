const C='rocketstar-v6';const F=['./','index.html','style.css','i18n.js','core.js','art.js','bossart.js','game.js','ui.js','storyart.js','privacy.html','manifest.json','icon-192.png','icon-512.png','icon-maskable-192.png','icon-maskable-512.png','studio-logo.png','fonts/ps2p.ttf'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim();});
// network-first so new builds show up; cache fallback for offline
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{if(r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));}return r;}).catch(()=>caches.match(e.request,{ignoreSearch:true})));});
