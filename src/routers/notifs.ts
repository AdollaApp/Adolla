import express from "express";
import db from "../db";
import { sendPushNotification } from "../util/push";
import { getUnreadCount } from "../util/unread";
const router = express.Router();

// POST /subscribe
router.post("/", async (req, res) => {
	console.log(req.body);

	if (!req.body.subscription) {
		res.status(400);
		res.json({
			error: "Invalid subscription",
		});
		return;
	}

	if (!db.get("push-clients")) db.set("push-clients", []);
	const clients = db.get("push-clients");
	clients.push(req.body);
	db.store(false);

	const unreadCount = await getUnreadCount();
	sendPushNotification({
		title: "New device added",
		body: "Notifications for new chapters have been enabled on a new device",
		badgeCount: unreadCount,
	});

	res.json({
		message: "Yep okay",
	});
});

export default router;
