//Event that shows a notification when is received by push
self.addEventListener("push", (event) => {
	const data = event.data.json();
	if (typeof data.title === "string")
		self.registration.showNotification(data.title, {
			body: data.body,
		});

	if ("setAppBadge" in navigator && typeof data.badgeCount === "number")
		navigator.setAppBadge(data.badgeCount ?? 2);
});
