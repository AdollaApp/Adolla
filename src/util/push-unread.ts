import getReading from "./getReading";
import { sendPushNotification } from "./push";

export async function sendBadgeCountUnread() {
	const reading = await getReading();
	const unreadNewCount = reading.filter((r) =>
		r.success ? r.progress.new : null
	).length;
	sendPushNotification({
		badgeCount: unreadNewCount,
	});
}

sendBadgeCountUnread();
