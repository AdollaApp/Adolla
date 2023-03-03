import db from "./db";
import { sendPushNotification } from "./util/push";

(async () => {
	await sendPushNotification({
		title: "This is a push notification",
		body: "Yep",
		badgeCount: 1,
	});

	console.log("Sent one, wait 5s for setting badge to 0");

	await new Promise((resolve) => setTimeout(resolve, 5e3));

	await sendPushNotification({
		title: "This is another push notification",
		body: "Yep :-)",
		badgeCount: 0,
	});
})();
