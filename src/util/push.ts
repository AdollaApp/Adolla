import db from "../db";
import webPush from "web-push";
import getReading from "./getReading";

export function configure() {
	if (!db.get("vapidPublic") || !db.get("vapidPrivate")) {
		const keys = webPush.generateVAPIDKeys();
		db.set("vapidPublic", keys.publicKey);
		db.set("vapidPrivate", keys.privateKey);
	}
}

// let badgeCount = 5;

// setInterval(async () => {
// 	const reading = await getReading();
// 	const unreadNewCount = reading.filter((r) =>
// 		r.success ? r.progress.new : null
// 	).length;

// 	console.log(
// 		"pushing",
// 		db.get("push-clients").map((t) => t.subscription)
// 	);

// 	badgeCount--;
// 	sendPushNotification({
// 		title: "This is my notification",
// 		body: "Hello world!" + badgeCount,
// 		badgeCount,
// 	});
// }, 10e3);

export async function sendPushNotification(body: {
	title: string;
	body?: string;
	badgeCount?: number;
}) {
	await Promise.all(
		(db.get("push-clients") || []).map(async ({ subscription }) => {
			const payload = JSON.stringify({
				title: body.title,
				body: body.body,
				badgeCount: body.badgeCount,
			});

			webPush.setVapidDetails(
				subscription.endpoint,
				db.get("vapidPublic"),
				db.get("vapidPrivate")
			);

			webPush.sendNotification(subscription, payload).catch(function (err) {
				console.log(err);
			});
		})
	);
}
