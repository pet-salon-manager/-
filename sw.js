
const CACHE='pawpal-v11-20260811';
const ASSETS=['./','index.html','style.css','app.js','manifest.json'];

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
    )).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  const req=e.request;
  const url=new URL(req.url);

  if(req.mode==='navigate' || /\.(html|js|css|json)$/.test(url.pathname)){
    e.respondWith(
      fetch(req,{cache:'no-store'})
        .then(res=>{
          const copy=res.clone();
          caches.open(CACHE).then(c=>c.put(req,copy));
          return res;
        })
        .catch(()=>caches.match(req).then(r=>r||caches.match('./')))
    );
    return;
  }

  e.respondWith(caches.match(req).then(r=>r||fetch(req)));
});
