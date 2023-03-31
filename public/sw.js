const CACHE_NAME = "manga-0";
let urlsToCache = ["/", "/css/main.css", "/js_compiled/404.js"];

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

//Event that shows a notification when is received by push
self.addEventListener("push", (event) => {
	const data = event.data.json();
	console.info(data);
	if (typeof data?.title === "string") {
		self.registration.showNotification(data.title, {
			body: data.body,
		});
	}
	if ("setAppBadge" in navigator && typeof data.badgeCount === "number") {
		navigator.setAppBadge(data.badgeCount ?? 2);
	}
});
