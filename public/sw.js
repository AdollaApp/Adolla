const CACHE_NAME = "manga-0";
let urlsToCache = ["/", "/css/main.css", "/js/404.js"];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
	);
	self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
	event.respondWith(
		(async function () {
			try {
				return await fetch(event.request);
			} catch (err) {
				return caches.match(event.request);
			}
		})()
	);
});
