// Used to get progress data.
// This data will be put in the database.
// This was put in /util because it's used more than once. Putting it in the router would be gross

import { Progress } from "../types";

interface ProgressDataOptions {
	current: number;
	total: number;
	chapterId: string | number;
	at?: number;
}

export default function getProgressData({
	current,
	total,
	chapterId,
	at = Date.now(),
}: ProgressDataOptions): Progress {
	return {
		current,
		total,
		percentage: Math.round((current / total) * 100),
		at,
		chapterId,
	};
}
