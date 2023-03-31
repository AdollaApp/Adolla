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
		if (Notification.permission === "granted") {
			doSubscribe();
		} else {
			button.classList.add("el-hidden");
		}
	}
}

function doSubscribe() {
	const button = document.querySelector(".push-notif-button");
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

//Generate subscription object
async function getSubscriptionObject() {
	const worker = (await navigator.serviceWorker.getRegistrations())[0];
	return await worker.pushManager
		.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
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
		console.error(err);
	});
}

//Decoder base64 to uint8
function urlBase64ToUint8Array(base64String) {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);
	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}
