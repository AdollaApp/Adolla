import getReading from "./getReading";

export async function getUnreadCount() {
	const reading = await getReading();
	const unreadNewCount = reading.filter((r) =>
		r.success ? r.progress.new : null
	).length;
	return unreadNewCount;
}
