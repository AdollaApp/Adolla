//Start subscription
const publicVapidKey = document
	.querySelector("[data-vapid-public]")
	.getAttribute("data-vapid-public");

if ("Notification" in window && Notification.permission === "default") {
	document.querySelector(".push-notif-button").classList.remove("el-hidden");
}

async function subscribeToPush() {
	const button = document.querySelector(".push-notif-button");
	if (window.Notification) {
		if (Notification.permission != "granted") {
			await new Promise((resolve) => {
				button.textContent = "Please hold!...";
				Notification.requestPermission(resolve).catch((err) => {
					alert(err);
					resolve(err);
				});
			});
		}
		console.log(2);
		if (Notification.permission === "granted") {
			console.log(3);
			getSubscriptionObject().then((obj) => {
				subscribe(obj).then((res) => {
					if (res.ok) {
						button.classList.add("el-hidden");
					} else {
						res.json().then((d) => alert(d.message));
					}
				});
			});
		}
	}
}

//Generate subscription object
function getSubscriptionObject() {
	return navigator.serviceWorker
		.register("/js_compiled/service-worker-push.js")
		.then(async (worker) => {
			await new Promise((resolve) => setTimeout(resolve, 2e3));
			return worker.pushManager
				.subscribe({
					userVisibleOnly: true,
					applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
				})
				.catch(function (err) {
					alert(err);
				});
		})
		.catch(function (err) {
			alert(err);
		});
}

//Send subscription to server
function subscribe(subscription) {
	return fetch(window.location.origin + "/subscribe", {
		method: "POST",
		body: JSON.stringify({
			subscription,
		}),
		headers: {
			"content-type": "application/json",
		},
	}).catch(function (err) {
		console.log(err);
	});
}

//Decoder base64 to uint8
function urlBase64ToUint8Array(base64String) {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
	console.log(base64);
	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);
	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}
