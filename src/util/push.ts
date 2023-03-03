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
				console.log(err);
				if (err.statusCode === 410) {
					console.log("Removing endpoint");

					clients = clients.filter(
						(client) => client.subscription.endpoint !== subscription.endpoint
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

	db.set("push-client", clients);
}
