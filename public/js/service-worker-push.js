//Event that shows a notification when is received by push
self.addEventListener("push", (event) => {
	const data = event.data.json();
	console.log(data, typeof data?.title === "string");
	if (typeof data?.title === "string") {
		console.log("Sending");
		self.registration.showNotification(data.title).then(console.log);
	}
	if ("setAppBadge" in navigator && typeof data.badgeCount === "number") {
		navigator.setAppBadge(data.badgeCount ?? 2);
	}
});
