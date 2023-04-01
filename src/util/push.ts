import db from "../db";
import webPush from "web-push";
import chalk from "chalk";

export function configure() {
	if (!db.get("vapidPublic") || !db.get("vapidPrivate")) {
		const keys = webPush.generateVAPIDKeys();
		db.set("vapidPublic", keys.publicKey);
		db.set("vapidPrivate", keys.privateKey);
	}
}

export async function sendPushNotification(body: {
	title?: string;
	body?: string;
	badgeCount?: number;
}) {
	if (!body.title)
		throw new Error("You can't make a push notification without a title");

	let clients = db.get("push-clients") || [];
	console.log(`Distributing to ${clients.length}:`, body);

	console.info(
		chalk.yellowBright("[PUSH]") +
			` Sending out message at ${new Date().toLocaleString()}: ${
				body.title
			} / badge: ${body.badgeCount}`
	);

	for (const { subscription } of clients) {
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
			.catch((err) => {
				if (err.statusCode === 410) {
					console.info(
						chalk.redBright("[PUSH]") + ` Failed to send out push:`,
						err.body
					);
				}
			});
		console.info(
			chalk[t?.statusCode === 201 ? "green" : "redBright"]("[PUSH]") +
				` Sent out message at ${new Date().toLocaleString()}: status code ${
					t?.statusCode
				}`
		);
	}

	console.info(
		chalk.green("[PUSH]") +
			` Done sending out message at ${new Date().toLocaleString()}: ${
				body.title
			} / badge: ${body.badgeCount}`
	);
}
