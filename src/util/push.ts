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

export async function sendBadgeCountUnread() {
	const reading = await getReading();
	const unreadNewCount = reading.filter((r) =>
		r.success ? r.progress.new : null
	).length;
	sendPushNotification({
		badgeCount: unreadNewCount,
	});
}

export async function sendPushNotification(body: {
	title?: string;
	body?: string;
	badgeCount?: number;
}) {
	const clients = db.get("push-clients") || [];
	console.log(`Distributing to ${clients.length}:`, body);
	for (const { subscription } of clients) {
		console.log("Doing");
		const payload = JSON.stringify({
			title: body.title,
			body: body.body,
			badgeCount: body.badgeCount,
		});

		await webPush.setVapidDetails(
			subscription.endpoint,
			db.get("vapidPublic"),
			db.get("vapidPrivate")
		);

		let t = await webPush
			.sendNotification(subscription, payload)
			.catch(function (err) {
				console.log(err);
			});
		console.log("Done", t);
	}
}

sendBadgeCountUnread();
