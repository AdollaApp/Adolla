
// Used to get progress data.
// This data will be put in the database.
// This was put in /util because it's used more than once. Putting it in the router would be gross

interface ProgressDataOptions {
	current: number;
	total: number;
	season: number;
	chapter: number;
}

export default function getProgressData({
	current,
	total,
	season,
	chapter
}: ProgressDataOptions) {
	
	return {
		current: current,
		total: total,
		percentage: Math.round((current / total) * 100),
		at: Date.now(),
		season,
		chapter	
	};
}